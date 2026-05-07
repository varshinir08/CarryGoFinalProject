INSERT INTO services (service_name, description, is_active)
SELECT 'Instant Delivery', 'Same-day delivery within the city for small packages', true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE service_name = 'Instant Delivery');

INSERT INTO services (service_name, description, is_active)
SELECT 'Scheduled Delivery', 'Book in advance for a convenient delivery time slot', true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE service_name = 'Scheduled Delivery');

INSERT INTO services (service_name, description, is_active)
SELECT 'Intercity Courier', 'Affordable courier service between major cities', true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE service_name = 'Intercity Courier');

INSERT INTO services (service_name, description, is_active)
SELECT 'Express Parcel', 'Priority handling and fastest possible delivery', true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE service_name = 'Express Parcel');

INSERT INTO services (service_name, description, is_active)
SELECT 'Grocery Delivery', 'Fresh groceries and essentials delivered to your door', true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE service_name = 'Grocery Delivery');
