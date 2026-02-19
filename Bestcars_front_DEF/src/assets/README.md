# Vehicle Images Organization

Images are now organized by car in separate folders for better management.

## Folder Structure

```
assets/
├── car-1/          # Audi RS6 Avant
├── car-2/          # BMW M4 CS
├── car-3/          # Porsche 911 Carrera S
├── car-4/          # Audi RS3
└── car-5/          # Porsche Cayenne Turbo GT
```

## How to Add New Images

1. **Add your image files** to the appropriate car folder (e.g., `car-4/rs3_1.jpeg`)

2. **Update `src/utils/imageMap.ts`**:
   - Import the new image at the top of the file
   - Add it to the `imageMap` object

   Example for RS3:
   ```typescript
   // At the top with other imports
   import rs3_1 from '../assets/car-4/rs3_1.jpeg';
   import rs3_2 from '../assets/car-4/rs3_2.jpeg';
   import rs3_3 from '../assets/car-4/rs3_3.jpeg';
   
   // In the imageMap object
   'rs3_1.jpeg': rs3_1,
   'rs3_2.jpeg': rs3_2,
   'rs3_3.jpeg': rs3_3,
   ```

3. **Update the vehicle data** in `BestCars_Back/src/controllers/vehicleController.ts`:
   - Make sure the `images` array uses the correct filenames
   - Example: `['rs3_1.jpeg', 'rs3_2.jpeg', 'rs3_3.jpeg']`

## Supported Image Formats

- `.jpeg` / `.jpg`
- `.png`
- `.webp`

## Notes

- Image filenames in the vehicle data should match the filenames in the folders
- The `imageMap` automatically maps filenames to the imported image paths
- If an image is not found in the map, it will fall back to the original filename (useful for external URLs)
