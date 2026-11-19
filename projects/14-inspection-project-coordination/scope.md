# Inspection status notifications

An operations lead requests an email when an inspection reaches its final status so coordinators can review the outcome without polling the status page.

The first release sends one email per completed inspection to the station's configured coordinator. The message contains the inspection ID, final status, and a link to the existing status page. SMS and historical backfill are outside this release.

| ID | Acceptance criterion |
| --- | --- |
| AC-1 | When an inspection reaches Passed or Failed and a coordinator is configured, send one email with ID, final status, and a working status link. |
| AC-2 | Reprocessing the same completion event does not send another email. |
| AC-3 | When the station has no configured coordinator, record a failed delivery with the inspection ID for operations review. |

Operations owns the recipient list. Engineering owns event delivery and deduplication. QA verifies the three acceptance criteria in staging before operations signs off.
