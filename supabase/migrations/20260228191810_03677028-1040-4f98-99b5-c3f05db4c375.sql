
-- Allow anyone to upload to the products bucket
CREATE POLICY "Allow public uploads to products bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

-- Allow anyone to update objects in products bucket
CREATE POLICY "Allow public updates to products bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products');

-- Allow anyone to delete objects in products bucket
CREATE POLICY "Allow public deletes from products bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'products');
