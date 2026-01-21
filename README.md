# Map Routing Backend (Uber-style)

1. Selection of source and destination points:

· Dropdown selects for start and end points
· Points loaded from backend API
· Each point has coordinates

2. Calculation of shortest path between two points:

· Dijkstra's algorithm implementation
· Graph with nodes and weighted edges
· Returns the shortest path based on distance

3. Calculation of total distance and estimated travel time:

· Total distance in kilometers
· Estimated time based on 40 km/h average speed
· Both displayed in the UI

4. Visual representation of the route:

· Simple map visualization using HTML/CSS
· Points drawn as circles
· Connections drawn as lines between points
· Color coding: green = start, red = end, blue = connections
· Step-by-step path display

5. Uber-style routing functionality:

· Point-to-point routing
· Route calculation
· Path visualization
· Distance and time estimates

API Endpoints:

· GET /api/points - Get all available points
· POST /api/route - Calculate route between points
· GET /api/test-route - Test route from A to E

Sample Data Points:

· A: Downtown (37.7749, -122.4194)
· B: North Area (37.7849, -122.4094)
· C: South Area (37.7649, -122.4294)
· D: East Area (37.7749, -122.3994)
· E: West Area (37.7949, -122.4194)

## Project Overview
A Node.js backend service that implements Uber-style map routing with Dijkstra's shortest path algorithm. This service calculates the optimal route between two points on a map, computes total distance and estimated travel time, and provides visual route representation.

## Features
- **Shortest Path Calculation** using Dijkstra's algorithm
- **Route Optimization** between any two points
- **Distance Calculation** in kilometers
- **Travel Time Estimation** based on average speed
- **GeoJSON Visual Representation** for mapping
- **RESTful API** for easy integration
- **Sample Map Data** included for testing
- **CORS Enabled** for frontend integration

##  Architecture
```
Map Routing Backend
├── Dijkstra's Algorithm (Priority Queue)
├── Graph Data Structure
├── REST API Endpoints
└── GeoJSON Route Visualization
```

## Tech Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Axios** - HTTP client (for potential external API integration)
- **CORS** - Cross-Origin Resource Sharing
- **Vanilla JavaScript** - No external routing libraries

## Project Structure
```
map-routing-backend/
├── server.js          # Main application file
├── package.json       # Dependencies
├── .env              # Environment variables (optional)
```

## Quick Start

### Installation

1. **Create project directory**
```bash
mkdir map-routing
cd map-routing
```

2. **Initialize npm project**
```bash
npm init -y
```

3. **Install dependencies**
```bash
npm install express body-parser axios dotenv cors
```

4. **Create server.js file** with the provided code

5. **Run the server**
```bash
node server.js
```

The server will start at: `http://localhost:3000`

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Available Endpoints

#### **GET /** - Home
Returns API information and available endpoints.
```bash
curl http://localhost:3000/
```

**Response:**
```json
{
  "service": "Map Routing API",
  "description": "Uber-style routing between points",
  "endpoints": [
    "POST /api/route - Calculate route between points",
    "GET /api/points - Get all available points"
  ]
}
```

#### **GET /api/points** - Get All Points
Returns all available points on the map.

```bash
curl http://localhost:3000/api/points
```

**Response:**
```json
{
  "success": true,
  "points": [
    {
      "id": "A",
      "lat": 37.7749,
      "lng": -122.4194
    },
    {
      "id": "B",
      "lat": 37.7849,
      "lng": -122.4094
    }
    // ... more points
  ],
  "count": 5
}
```

#### **POST /api/route** - Calculate Route
Calculates the shortest route between two points.

**Request:**
```bash
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{"startId": "A", "endId": "E"}'
```

**Response:**
```json
{
  "success": true,
  "route": {
    "path": [
      {
        "id": "A",
        "lat": 37.7749,
        "lng": -122.4194
      },
      {
        "id": "B",
        "lat": 37.7849,
        "lng": -122.4094
      },
      {
        "id": "E",
        "lat": 37.7949,
        "lng": -122.4194
      }
    ],
    "totalDistance": "6.30",
    "estimatedTime": 9,
    "startPoint": {
      "id": "A",
      "lat": 37.7749,
      "lng": -122.4194
    },
    "endPoint": {
      "id": "E",
      "lat": 37.7949,
      "lng": -122.4194
    },
    "visualRepresentation": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [-122.4194, 37.7749],
              [-122.4094, 37.7849],
              [-122.4194, 37.7949]
            ]
          },
          "properties": {
            "distance": "6.30",
            "time": 9,
            "color": "#007bff",
            "width": 3
          }
        }
        // ... start and end markers
      ]
    },
    "summary": {
      "from": "A",
      "to": "E",
      "distance": "6.30 km",
      "time": "9 minutes"
    }
  }
}
```

#### **GET /api/test-route** - Test Route
Returns a pre-calculated test route from point A to E.

```bash
curl http://localhost:3000/api/test-route
```

##  Sample Map Data

The system comes with 5 pre-defined points:

| Point ID | Name       | Latitude | Longitude |
| -------- | ---------- | -------- | --------- |
| A        | Downtown   | 37.7749  | -122.4194 |
| B        | North Area | 37.7849  | -122.4094 |
| C        | South Area | 37.7649  | -122.4294 |
| D        | East Area  | 37.7749  | -122.3994 |
| E        | West Area  | 37.7949  | -122.4194 |

**Roads with distances:**
- A ↔ B: 2.5 km
- A ↔ C: 3.2 km
- A ↔ D: 4.1 km
- B ↔ D: 2.8 km
- B ↔ E: 3.5 km
- C ↔ D: 2.1 km
- D ↔ E: 3.8 km

##  Algorithm Details

### Dijkstra's Algorithm Implementation
```javascript
// Priority Queue ensures efficient node selection
enqueue(node, priority)  // Add node with priority
dequeue()               // Remove highest priority node
isEmpty()               // Check if queue is empty

// Main algorithm flow:
1. Initialize all distances as Infinity
2. Set start distance to 0
3. Use priority queue to always process nearest node
4. Update distances to neighboring nodes
5. Track previous nodes to reconstruct path
6. Continue until destination is reached
```

### Time Complexity
- **O(E log V)** where E is edges and V is vertices
- Uses priority queue for optimal node selection
- Efficient for sparse graphs (typical for road networks)

##  Configuration

### Environment Variables (Optional)
Create a `.env` file:
```env
PORT=3000
NODE_ENV=development
```

### Extending the Map
To add more points and roads:

```javascript
// Add new points
cityMap.addPoint('F', 37.8000, -122.4000); // New point

// Add new roads
cityMap.addRoad('A', 'F', 5.2);  // Connect new point to existing ones
cityMap.addRoad('F', 'E', 4.3);
```

##  How It Works

### 1. **Graph Representation**
```
Nodes: Points (A, B, C, D, E)
Edges: Roads with distances
Graph: Weighted, undirected
```

### 2. **Route Calculation Process**
```
Input: Start ID, End ID
→ Validate points exist
→ Run Dijkstra's algorithm
→ Reconstruct shortest path
→ Calculate total distance
→ Estimate travel time (40 km/h average)
→ Generate GeoJSON visualization
→ Return formatted response
```

### 3. **Travel Time Estimation**
```
Formula: time = (distance / 40) * 60 minutes
Assumption: Average speed of 40 km/h
Result: Rounded to nearest minute
```

##  Testing

### Test with curl
```bash
# Test all endpoints
curl http://localhost:3000/
curl http://localhost:3000/api/points
curl http://localhost:3000/api/test-route

# Test route calculation
curl -X POST http://localhost:3000/api/route \
  -H "Content-Type: application/json" \
  -d '{"startId": "A", "endId": "C"}'
```

### Expected Test Results
- A → E: Distance 6.30 km, Time 9 minutes
- A → C: Distance 3.20 km, Time 5 minutes
- B → D: Distance 2.80 km, Time 4 minutes

##  Debugging

### Common Issues:
1. **No route found**: Points may not be connected
2. **Invalid point ID**: Check available points at `/api/points`
3. **CORS errors**: Ensure frontend URL is allowed
4. **Server not starting**: Check port availability

### Logging:
The server logs to console:
- Server start message with URL
- API requests (add middleware for detailed logging)

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all endpoints are working
3. Test with the `/api/test-route` endpoint
4. Review the algorithm implementation
