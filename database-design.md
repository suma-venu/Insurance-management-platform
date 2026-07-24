Database Tables:

Users
-------------------------------
id
name
email
password
role
--------------------------------

Customers
--------------------------------------
id
name
dob
phone
address
email
----------------------------------
Policies
id
customer_id
policy_type
policy_number
premium_amount
start_date
end_date
status
-----------------------------------
Claims
------------------------------
id
policy_id
claim_amount
reason
status
submission_date
----------------------------

Premium Payments
-------------------------
id
policy_id
payment_date
amount
payment_status
-----------------------
Documents
----------------------
id
customer_id
file_name
file_path
uploaded_at


Note: Passwords will be managed securely through Supabase Authentication and will not be stored directly in the Users table.
