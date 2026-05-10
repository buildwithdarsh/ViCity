# Mock Mode

The app runs entirely offline using IndexedDB. No backend is required.

## Demo User (Always Logged In)

The app automatically logs in as **Ananya Desai** on every page load. No login is needed.

| Field        | Value                      |
|-------------|---------------------------|
| Name        | Ananya Desai              |
| Phone       | 9876543210                |
| Email       | ananya.desai@gmail.com    |
| Role        | Customer                  |
| Member Since| March 2024                |
| User ID     | usr-001                   |

### Her History

- **13 bookings** spanning every status (confirmed, checked_in, checked_out, cancelled, pending)
- **8 reviews** across all room types (5-star to 4-star, with one pending)
- **25+ notifications** (booking confirmations, payment receipts, check-in reminders, promotions, refund notices)
- **Stayed in every room type** (ViCity, Garden Suite, Pool Cabana, Heritage Room)
- **1 active check-in** (Heritage Room, Mar 16-19)
- **1 upcoming booking** (ViCity full-villa birthday week, May 15-20)
- **1 cancelled + refunded** booking
- **1 pending** booking (monsoon getaway, Aug 10-14)

## Admin Access

Navigate to `/admin/login` and use:

| Role         | Phone        | Password     |
|-------------|-------------|-------------|
| Admin       | 9999000001  | Admin@1234  |
| Super Admin | 9999000002  | Staff@1234  |

## Payment Flow

Razorpay is bypassed. All payments auto-succeed with a mock payment ID.

## OTP Verification

Any 4+ digit OTP is accepted. The mock OTP is `1234`.
