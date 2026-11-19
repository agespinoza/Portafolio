# Backup architecture

```mermaid
flowchart LR
    Workstations --> Share[Office file share]
    Share -->|Nightly snapshots| NAS[Local backup NAS]
    NAS -->|Nightly encrypted replication| Cloud[Offsite object storage]
    NAS --> Restore[Isolated restore workstation]
    Cloud --> Restore
```

Retain 14 daily local snapshots and 30 daily offsite snapshots. Keep the offsite recovery credential separate from the file share administrator account. Verify that the nightly replication completed before counting that snapshot toward the recovery point objective.
