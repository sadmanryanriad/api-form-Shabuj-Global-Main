# Event Management API `/events`

This API allows users to create, retrieve, update, and delete events.  

## Base URL  
```
https://api-form.studyuk.today/api/events
```

## Endpoints  

### 1. Create Event  
**Endpoint:**  
```
POST /api/events
```  
**Description:**  
Creates a new event.  

**Request Body (JSON):**  
```json
{
  "title": "Tech Conference 2024",
  "description": "A conference about the latest in technology.",
  "eventStartDateTime": "2024-05-20T10:00:00Z",
  "eventEndDateTime": "2024-05-20T18:00:00Z",
  "place": "New York Convention Center",
  "organizer": "TechWorld",
  "category": "Technology",
  "isOnline": false,
  "eventURL": "https://techconference.com",
  "joinURL": "",
  "eventImage": "https://example.com/event-image.jpg",
  "imageGallery": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```  

**Response:**  
```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "65f4a9e5a3b3a8f3c9d41e2a",
    "title": "Tech Conference 2024",
    "description": "A conference about the latest in technology.",
    "eventStartDateTime": "2024-05-20T10:00:00.000Z",
    "eventEndDateTime": "2024-05-20T18:00:00.000Z",
    "place": "New York Convention Center",
    "organizer": "TechWorld",
    "category": "Technology",
    "isOnline": false,
    "eventURL": "https://techconference.com",
    "joinURL": "",
    "eventImage": "https://example.com/event-image.jpg",
    "imageGallery": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  }
}
```  

---

### 2. Get All Events  
**Endpoint:**  
```
GET /api/events
```  
**Description:**  
Retrieves all events.  

**Response:**  
```json
[
  {
    "_id": "65f4a9e5a3b3a8f3c9d41e2a",
    "title": "Tech Conference 2024",
    "description": "A conference about the latest in technology.",
    "eventStartDateTime": "2024-05-20T10:00:00.000Z",
    "eventEndDateTime": "2024-05-20T18:00:00.000Z",
    "place": "New York Convention Center",
    "organizer": "TechWorld",
    "category": "Technology",
    "isOnline": false,
    "eventURL": "https://techconference.com",
    "joinURL": "",
    "eventImage": "https://example.com/event-image.jpg",
    "imageGallery": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  }
]
```  

---

### 3. Get Single Event by ID  
**Endpoint:**  
```
GET /api/events/:id
```  
**Description:**  
Retrieves an event by its ID.  

**Example Request:**  
```
GET /api/events/65f4a9e5a3b3a8f3c9d41e2a
```  

**Response:**  
```json
{
  "_id": "65f4a9e5a3b3a8f3c9d41e2a",
  "title": "Tech Conference 2024",
  "description": "A conference about the latest in technology.",
  "eventStartDateTime": "2024-05-20T10:00:00.000Z",
  "eventEndDateTime": "2024-05-20T18:00:00.000Z",
  "place": "New York Convention Center",
  "organizer": "TechWorld",
  "category": "Technology",
  "isOnline": false,
  "eventURL": "https://techconference.com",
  "joinURL": "",
  "eventImage": "https://example.com/event-image.jpg",
  "imageGallery": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```  

---

### 4. Update Event  
**Endpoint:**  
```
PATCH /api/events/:id
```  
**Description:**  
Updates an existing event.  

**Example Request:**  
```
PATCH /api/events/65f4a9e5a3b3a8f3c9d41e2a
```  

**Request Body (JSON) (Add any other property as you need):**  
```json
{
  "title": "Updated Tech Conference 2024"
}
```  

**Response:**  
```json
{
  "_id": "65f4a9e5a3b3a8f3c9d41e2a",
  "title": "Updated Tech Conference 2024",
  "description": "A conference about the latest in technology.",
  "eventStartDateTime": "2024-05-20T10:00:00.000Z",
  "eventEndDateTime": "2024-05-20T18:00:00.000Z",
  "place": "New York Convention Center",
  "organizer": "TechWorld",
  "category": "Technology",
  "isOnline": false,
  "eventURL": "https://techconference.com",
  "joinURL": "",
  "eventImage": "https://example.com/event-image.jpg",
  "imageGallery": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```  
### Two ways to Patch `imageGallery`

#### **Case 1: Updating Event Without `append=true` (Replacing `imageGallery`)**  
**Endpoint:**  
```
PATCH /api/events/:id
```  
**Description:**  
Updates the event details. If `imageGallery` is provided, it replaces the existing images with the new ones.  

**Example Request:**  
```
PATCH /api/events/65f4a9e5a3b3a8f3c9d41e2a
```  

**Request Body (JSON) (Replacing `imageGallery`):**  
```json
{
  "title": "Updated Tech Conference",
  "imageGallery": ["https://example.com/new-image1.jpg", "https://example.com/new-image2.jpg"]
}
```  

**Response:**  
```json
{
  "_id": "65f4a9e5a3b3a8f3c9d41e2a",
  "title": "Updated Tech Conference",
  "description": "A conference about the latest in technology.",
  "eventStartDateTime": "2024-05-20T10:00:00.000Z",
  "eventEndDateTime": "2024-05-20T18:00:00.000Z",
  "place": "New York Convention Center",
  "organizer": "TechWorld",
  "category": "Technology",
  "isOnline": false,
  "eventURL": "https://techconference.com",
  "joinURL": "",
  "eventImage": "https://example.com/event-image.jpg",
  "imageGallery": [
    "https://example.com/new-image1.jpg",
    "https://example.com/new-image2.jpg"
  ]
}
```  
✅ **Existing `imageGallery` is replaced with the new list.**  

---

#### **Case 2: Updating Event With `append=true` (Appending to `imageGallery`)**  
**Endpoint:**  
```
PATCH /api/events/:id/?append=true
```  
**Description:**  
Appends new images to the existing `imageGallery` instead of replacing it.  

**Example Request:**  
```
PATCH /api/events/65f4a9e5a3b3a8f3c9d41e2a/?append=true
```  

**Request Body (JSON) (Adding new images):**  
```json
{
  "imageGallery": ["https://example.com/new-image3.jpg"]
}
```  

**Response:**  
```json
{
  "_id": "65f4a9e5a3b3a8f3c9d41e2a",
  "title": "Updated Tech Conference",
  "description": "A conference about the latest in technology.",
  "eventStartDateTime": "2024-05-20T10:00:00.000Z",
  "eventEndDateTime": "2024-05-20T18:00:00.000Z",
  "place": "New York Convention Center",
  "organizer": "TechWorld",
  "category": "Technology",
  "isOnline": false,
  "eventURL": "https://techconference.com",
  "joinURL": "",
  "eventImage": "https://example.com/event-image.jpg",
  "imageGallery": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/new-image3.jpg"
  ]
}
```  
✅ **New images are appended instead of replacing the existing ones.**  

---

### 5. Delete Event  
**Endpoint:**  
```
DELETE /api/events/:id
```  
**Description:**  
Deletes an event by ID.  

**Example Request:**  
```
DELETE /api/events/65f4a9e5a3b3a8f3c9d41e2a
```  

**Response:**  
```json
{
  "message": "Event deleted successfully"
}
```  

---

## Error Handling  
- `400 Bad Request` → Invalid request data (e.g., `imageGallery` must be an array).  
- `404 Not Found` → Event does not exist.  
- `500 Internal Server Error` → Unexpected errors.  

<!-- ---

## Notes  
- **Date format:** Use **ISO 8601** format (`YYYY-MM-DDTHH:mm:ssZ`).   -->
