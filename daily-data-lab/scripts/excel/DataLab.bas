' DataLab: analyst tools shared by every Daily Data Lab workbook (Excel for Windows and Mac, no external references).
' The workbook stores its settings in named cells on the Config sheet:
'   cfgMainTable   name of the main Excel table (ListObject)
'   cfgPivotRows   column used for pivot rows        cfgPivotCols  column used for pivot columns (may be empty)
'   cfgPivotValue  column summarised in the pivot    cfgPivotFunc  sum, count or average
'   cfgLastRun     time of the last refresh and check
'   cfgSelector / cfgSelectorDefault   the Analysis selector cell and its default value
' Quality checks live in the table tblChecks (column "Result" holds PASS or FAIL formulas).
Option Explicit

Private Const XL_DATABASE As Long = 1
Private Const XL_ROW_FIELD As Long = 1
Private Const XL_COLUMN_FIELD As Long = 2
Private Const XL_SUM As Long = -4157
Private Const XL_COUNT As Long = -4112
Private Const XL_AVERAGE As Long = -4106
Private Const XL_CSV_UTF8 As Long = 62

Private Function Cfg(ByVal key As String) As String
    On Error Resume Next
    Cfg = CStr(ThisWorkbook.Names(key).RefersToRange.Value)
End Function

Private Function FindTable(ByVal tableName As String) As ListObject
    Dim ws As Worksheet, lo As ListObject
    For Each ws In ThisWorkbook.Worksheets
        For Each lo In ws.ListObjects
            If StrComp(lo.Name, tableName, vbTextCompare) = 0 Then
                Set FindTable = lo
                Exit Function
            End If
        Next lo
    Next ws
End Function

Private Function NewSheet(ByVal baseName As String) As Worksheet
    Dim ws As Worksheet, nm As String, i As Long
    nm = baseName
    Do While SheetExists(nm)
        i = i + 1
        nm = Left(baseName, 26) & " (" & i & ")"
    Loop
    Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
    ws.Name = nm
    ActiveWindow.DisplayGridlines = False
    Set NewSheet = ws
End Function

Private Function SheetExists(ByVal nm As String) As Boolean
    Dim ws As Worksheet
    For Each ws In ThisWorkbook.Worksheets
        If StrComp(ws.Name, nm, vbTextCompare) = 0 Then SheetExists = True
    Next ws
End Function

' Recalculates every formula, runs the quality checks and stamps the time on the README.
Public Sub DL_RefreshAndCheck()
    Dim lo As ListObject, r As ListRow, passN As Long, failN As Long, failList As String, col As Long
    Application.CalculateFull
    Set lo = FindTable("tblChecks")
    If Not lo Is Nothing Then
        col = lo.ListColumns("Result").Index
        For Each r In lo.ListRows
            If UCase(CStr(r.Range.Cells(1, col).Value)) = "PASS" Then
                passN = passN + 1
            Else
                failN = failN + 1
                failList = failList & vbLf & "  - " & r.Range.Cells(1, 2).Value
            End If
        Next r
    End If
    On Error Resume Next
    ThisWorkbook.Names("cfgLastRun").RefersToRange.Value = Now
    On Error GoTo 0
    MsgBox "Recalculated." & vbLf & passN & " checks passed, " & failN & " failed." & failList, _
        IIf(failN = 0, vbInformation, vbExclamation), "Daily Data Lab"
End Sub

' Saves every Excel table in the workbook as a UTF-8 CSV next to the workbook.
Public Sub DL_ExportTablesToCSV()
    Dim ws As Worksheet, lo As ListObject, wb As Workbook, base As String, n As Long, sep As String
    If ThisWorkbook.Path = "" Then
        MsgBox "Save the workbook first, so the CSV files have a folder to go to.", vbExclamation, "Daily Data Lab"
        Exit Sub
    End If
    sep = Application.PathSeparator
    base = ThisWorkbook.Path & sep & Replace(Replace(ThisWorkbook.Name, ".xlsm", ""), ".xlsx", "")
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    On Error GoTo Failed
    For Each ws In ThisWorkbook.Worksheets
        For Each lo In ws.ListObjects
            Set wb = Workbooks.Add
            lo.Range.Copy
            wb.Worksheets(1).Range("A1").PasteSpecial xlPasteValues
            wb.SaveAs Filename:=base & "_" & lo.Name & ".csv", FileFormat:=XL_CSV_UTF8
            wb.Close SaveChanges:=False
            n = n + 1
        Next lo
    Next ws
    Application.CutCopyMode = False
    Application.DisplayAlerts = True
    Application.ScreenUpdating = True
    MsgBox n & " tables saved as CSV next to this workbook.", vbInformation, "Daily Data Lab"
    Exit Sub
Failed:
    Application.DisplayAlerts = True
    Application.ScreenUpdating = True
    MsgBox "Could not save the CSV files: " & Err.Description, vbExclamation, "Daily Data Lab"
End Sub

' Builds a PivotTable from the main table, using the fields named on the Config sheet.
Public Sub DL_BuildPivot()
    Dim lo As ListObject, ws As Worksheet, pc As PivotCache, pt As PivotTable, f As String, fn As Long, fnName As String
    Set lo = FindTable(Cfg("cfgMainTable"))
    If lo Is Nothing Then
        MsgBox "Main table not found: " & Cfg("cfgMainTable"), vbExclamation, "Daily Data Lab"
        Exit Sub
    End If
    Set ws = NewSheet("Pivot")
    Set pc = ThisWorkbook.PivotCaches.Create(SourceType:=XL_DATABASE, SourceData:=lo.Name)
    Set pt = pc.CreatePivotTable(TableDestination:=ws.Range("B4"), TableName:="pvt" & Format(Now, "hhmmss"))
    Select Case LCase(Cfg("cfgPivotFunc"))
        Case "count": fn = XL_COUNT: fnName = "Count of "
        Case "average": fn = XL_AVERAGE: fnName = "Average of "
        Case Else: fn = XL_SUM: fnName = "Sum of "
    End Select
    ws.Range("B2").Value = "Pivot of " & lo.Name & ": " & LCase(fnName) & Cfg("cfgPivotValue") & " by " & Cfg("cfgPivotRows")
    ws.Range("B2").Font.Bold = True
    pt.PivotFields(Cfg("cfgPivotRows")).Orientation = XL_ROW_FIELD
    f = Cfg("cfgPivotCols")
    If Len(f) > 0 Then pt.PivotFields(f).Orientation = XL_COLUMN_FIELD
    pt.AddDataField pt.PivotFields(Cfg("cfgPivotValue")), fnName & Cfg("cfgPivotValue"), fn
    pt.DataBodyRange.NumberFormat = "#,##0.##"
    ws.Columns.AutoFit
End Sub

' Profiles every column of the main table: type, filled, blanks, distinct values, min, max, mean, median, standard deviation.
Public Sub DL_ProfileTable()
    Dim lo As ListObject, ws As Worksheet, c As ListColumn, r As Long, rng As Range, cell As Range
    Dim seen As Collection, distinct As Long, nums As Long, wf As WorksheetFunction
    Set lo = FindTable(Cfg("cfgMainTable"))
    If lo Is Nothing Then Exit Sub
    If lo.ListRows.Count = 0 Then Exit Sub
    Set wf = Application.WorksheetFunction
    Set ws = NewSheet("Profile")
    ws.Range("B2").Value = "Column profile of " & lo.Name & " (" & lo.ListRows.Count & " rows)"
    ws.Range("B2").Font.Bold = True
    ws.Range("B4:K4").Value = Array("Column", "Type", "Filled", "Blank", "Distinct", "Min", "Max", "Mean", "Median", "Std dev")
    ws.Range("B4:K4").Font.Bold = True
    r = 5
    Application.ScreenUpdating = False
    For Each c In lo.ListColumns
        Set rng = c.DataBodyRange
        Set seen = New Collection
        distinct = 0
        On Error Resume Next
        For Each cell In rng.Cells
            If Not IsEmpty(cell.Value) Then
                seen.Add True, "k" & CStr(cell.Value)
                If Err.Number = 0 Then distinct = distinct + 1
                Err.Clear
            End If
        Next cell
        On Error GoTo 0
        nums = wf.Count(rng)
        ws.Cells(r, 2).Value = c.Name
        ws.Cells(r, 3).Value = IIf(nums > 0, "number", "text")
        ws.Cells(r, 4).Value = wf.CountA(rng)
        ws.Cells(r, 5).Value = rng.Cells.Count - wf.CountA(rng)
        ws.Cells(r, 6).Value = distinct
        If nums > 0 Then
            ws.Cells(r, 7).Value = wf.Min(rng)
            ws.Cells(r, 8).Value = wf.Max(rng)
            ws.Cells(r, 9).Value = wf.Average(rng)
            ws.Cells(r, 10).Value = wf.Median(rng)
            If nums > 1 Then ws.Cells(r, 11).Value = wf.StDev(rng)
        End If
        r = r + 1
    Next c
    ws.Range("G5:K" & r).NumberFormat = "#,##0.00"
    ws.Columns("B:K").AutoFit
    Application.ScreenUpdating = True
End Sub

' Clears the filters of every Excel table and puts the Analysis selector back to its default.
Public Sub DL_ResetView()
    Dim ws As Worksheet, lo As ListObject
    For Each ws In ThisWorkbook.Worksheets
        For Each lo In ws.ListObjects
            If lo.ShowAutoFilter Then
                If lo.AutoFilter.FilterMode Then lo.AutoFilter.ShowAllData
            End If
        Next lo
    Next ws
    On Error Resume Next
    ThisWorkbook.Names("cfgSelector").RefersToRange.Value = ThisWorkbook.Names("cfgSelectorDefault").RefersToRange.Value
    On Error GoTo 0
    Application.Calculate
End Sub

Public Sub DL_GoHome()
    ThisWorkbook.Worksheets("README").Activate
    ThisWorkbook.Worksheets("README").Range("A1").Select
End Sub

' 95% Wilson score interval for k successes out of n: side = -1 lower bound, +1 upper bound.
Public Function DL_WILSON(ByVal k As Double, ByVal n As Double, Optional ByVal side As Long = -1, Optional ByVal z As Double = 1.96) As Variant
    Dim p As Double, centre As Double, half As Double, den As Double
    If n <= 0 Then
        DL_WILSON = CVErr(xlErrDiv0)
        Exit Function
    End If
    p = k / n
    den = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / den
    half = z * Sqr(p * (1 - p) / n + z * z / (4 * n * n)) / den
    DL_WILSON = centre + Sgn(side) * half
End Function

' Used by the build script to confirm the macros compiled.
Public Function DL_SelfTest() As String
    DL_SelfTest = "OK " & ThisWorkbook.Worksheets.Count & " sheets, checks table " & IIf(FindTable("tblChecks") Is Nothing, "missing", "found")
End Function
