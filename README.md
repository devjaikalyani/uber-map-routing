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