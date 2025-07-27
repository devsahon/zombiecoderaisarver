# License Management Test Cases

## Backend
| Test Case | Steps | Expected Result |
|-----------|-------|----------------|
| Create License | POST /api/licenses | License created, status=valid |
| Expired License | Set expiry_date < today, checkLicense() | status=invalid, access denied |
| Renew License | PUT /api/licenses/{id} (new expiry) | status=valid, expiry_date updated |
| Disable License | PUT /api/licenses/{id} (status=invalid) | status=invalid, access denied |
| Assign License to Project | POST /api/licenses (project_id) | License linked to project |
| Invalid License Access | Middleware-protected route, invalid license | 403 Forbidden |
| File Delete on Invalid | Expire license, check protected file | File deleted, log entry |
| Notification on Expiry | Set expiry_date ~today+7, run cron | Email/SMS sent |

## UI
| Test Case | Steps | Expected Result |
|-----------|-------|----------------|
| List Licenses | Visit LicenseList.vue | All licenses shown, status color-coded |
| Renew License | Click Renew | Expiry updated, feedback shown |
| Disable License | Click Disable | Status=invalid, feedback shown |
| Assign License | Use ProjectLicenseAssign.vue | License assigned, feedback shown |
| Real-time Status | Change license, check UI | Status/feedback updates instantly |

## Dispatcher
| Test Case | Steps | Expected Result |
|-----------|-------|----------------|
| Valid License | dispatch() with valid project_id | Agent runs normally |
| Invalid License | dispatch() with invalid/expired | Error message, agent blocked | 