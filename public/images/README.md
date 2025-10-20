# Images Directory

This directory contains all the images used throughout the HALT Shelter website.

## Directory Structure

### `/stories/`
Contains images for rescue stories and success stories:
- `bella-second-chance.jpg` - Bella's rescue story
- `emergency-kitten-rescue.jpg` - Kitten rescue during storm
- `max-medical-miracle.jpg` - Max's surgery recovery
- `luna-journey-home.jpg` - Luna's rehabilitation story
- `highway-heroes.jpg` - Large rescue operation
- `charlie-cancer-battle.jpg` - Charlie's cancer treatment

### `/animals/`
Contains images of animals available for adoption or general shelter photos:
- Individual animal photos for adoption listings
- General shelter facility photos
- Volunteer activity photos

## Image Guidelines

### File Naming Convention
- Use lowercase letters and hyphens for spacing
- Include descriptive names that match story slugs
- Use appropriate file extensions (.jpg, .png, .webp)

### Image Specifications
- **Story Featured Images**: 400x300px minimum, 16:9 or 4:3 aspect ratio
- **Story Detail Images**: 600x400px minimum, 3:2 aspect ratio
- **Animal Photos**: 300x300px minimum, square aspect ratio preferred
- **File Size**: Keep under 500KB for web optimization

### Usage in Code
Once images are added, update the featuredImage URLs in the story data:

```javascript
// Instead of placeholder SVG, use:
featuredImage: "/images/stories/bella-second-chance.jpg"
```

## Current Placeholder Status
All stories currently use base64 SVG placeholders to prevent infinite API requests. Replace these with actual image paths once photos are uploaded to this directory.
