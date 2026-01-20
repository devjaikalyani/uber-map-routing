import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Map Routing (Uber-style)
// Priority Queue for Dijkstra's Algorithm

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(node, priority) {
        this.elements.push({ node, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift();
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

// Graph for Map Routing
class MapGraph {
    constructor() {
        this.nodes = new Map(); // nodeId -> {id, lat, lng}
        this.adjacencyList = new Map(); // nodeId -> [{neighborId, distance}]
    }

    // Add a point to the map
    addPoint(id, lat, lng) {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, { id, lat, lng });
            this.adjacencyList.set(id, []);
        }
    }

    // Add a road between two points
    addRoad(point1, point2, distance) {
        if (!this.nodes.has(point1)) return false;
        if (!this.nodes.has(point2)) return false;
        
        this.adjacencyList.get(point1).push({ node: point2, distance });
        this.adjacencyList.get(point2).push({ node: point1, distance });
        return true;
    }

    // Dijkstra's Algorithm to find shortest path
    findShortestPath(startId, endId) {
        // Validate points exist
        if (!this.nodes.has(startId) || !this.nodes.has(endId)) {
            return null;
        }

        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        const pq = new PriorityQueue();

        // Initialize distances to infinity
        for (const nodeId of this.nodes.keys()) {
            distances.set(nodeId, Infinity);
            previous.set(nodeId, null);
        }

        // Start point distance is 0
        distances.set(startId, 0);
        pq.enqueue(startId, 0);

        // Main Dijkstra loop
        while (!pq.isEmpty()) {
            const { node: currentNode } = pq.dequeue();
            
            if (visited.has(currentNode)) continue;
            if (currentNode === endId) break;
            
            visited.add(currentNode);
            
            // Check all neighbors
            const neighbors = this.adjacencyList.get(currentNode) || [];
            for (const neighbor of neighbors) {
                if (visited.has(neighbor.node)) continue;
                
                const newDist = distances.get(currentNode) + neighbor.distance;
                
                if (newDist < distances.get(neighbor.node)) {
                    distances.set(neighbor.node, newDist);
                    previous.set(neighbor.node, currentNode);
                    pq.enqueue(neighbor.node, newDist);
                }
            }
        }

        // Reconstruct path
        const path = [];
        let current = endId;
        
        if (previous.get(endId) !== null || startId === endId) {
            while (current !== null) {
                path.unshift(this.nodes.get(current));
                current = previous.get(current);
            }
        }

        if (path.length === 0) return null;

        // Calculate total distance
        const totalDistance = distances.get(endId);
        
        // Calculate estimated travel time (assuming average speed of 40 km/h)
        const estimatedTimeMinutes = Math.round((totalDistance / 40) * 60);

        return {
            path: path,
            totalDistance: totalDistance.toFixed(2),
            estimatedTime: estimatedTimeMinutes,
            startPoint: this.nodes.get(startId),
            endPoint: this.nodes.get(endId)
        };
    }

    // Get all points in the graph
    getAllPoints() {
        return Array.from(this.nodes.values());
    }
}

// Create and initialize the map with sample data
const cityMap = new MapGraph();

// Add sample points (coordinates are arbitrary)
cityMap.addPoint('A', 37.7749, -122.4194); // Downtown
cityMap.addPoint('B', 37.7849, -122.4094); // North Area
cityMap.addPoint('C', 37.7649, -122.4294); // South Area
cityMap.addPoint('D', 37.7749, -122.3994); // East Area
cityMap.addPoint('E', 37.7949, -122.4194); // West Area

// Add roads with distances in kilometers
cityMap.addRoad('A', 'B', 2.5);
cityMap.addRoad('A', 'C', 3.2);
cityMap.addRoad('A', 'D', 4.1);
cityMap.addRoad('B', 'D', 2.8);
cityMap.addRoad('B', 'E', 3.5);
cityMap.addRoad('C', 'D', 2.1);
cityMap.addRoad('D', 'E', 3.8);

// API Endpoints

// Home page with instructions
app.get('/', (req, res) => {
    res.json({
        service: 'Map Routing API',
        description: 'Uber-style routing between points',
        endpoints: [
            'POST /api/route - Calculate route between points',
            'GET /api/points - Get all available points'
        ]
    });
});

// Get all available points
app.get('/api/points', (req, res) => {
    const points = cityMap.getAllPoints();
    res.json({
        success: true,
        points: points,
        count: points.length
    });
});

// Calculate route between two points
app.post('/api/route', (req, res) => {
    try {
        const { startId, endId } = req.body;
        
        if (!startId || !endId) {
            return res.status(400).json({
                success: false,
                error: 'Both startId and endId are required'
            });
        }

        const result = cityMap.findShortestPath(startId, endId);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'No route found between the specified points'
            });
        }

        // Add visual representation data (geojson format)
        const visualRoute = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: result.path.map(point => [point.lng, point.lat])
                    },
                    properties: {
                        distance: result.totalDistance,
                        time: result.estimatedTime,
                        color: '#007bff',
                        width: 3
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [result.startPoint.lng, result.startPoint.lat]
                    },
                    properties: {
                        title: 'Start',
                        color: '#28a745',
                        marker: 'start'
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [result.endPoint.lng, result.endPoint.lat]
                    },
                    properties: {
                        title: 'End',
                        color: '#dc3545',
                        marker: 'end'
                    }
                }
            ]
        };

        res.json({
            success: true,
            route: {
                ...result,
                visualRepresentation: visualRoute,
                summary: {
                    from: result.startPoint.id,
                    to: result.endPoint.id,
                    distance: `${result.totalDistance} km`,
                    time: `${result.estimatedTime} minutes`
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Simple test endpoint
app.get('/api/test-route', (req, res) => {
    // Test route from A to E
    const result = cityMap.findShortestPath('A', 'E');
    
    if (!result) {
        return res.json({ error: 'Test route not found' });
    }

    res.json({
        testRoute: {
            from: 'A (Downtown)',
            to: 'E (West Area)',
            path: result.path.map(p => p.id),
            distance: `${result.totalDistance} km`,
            estimatedTime: `${result.estimatedTime} minutes`,
            waypoints: result.path.map(p => ({
                id: p.id,
                coordinates: { lat: p.lat, lng: p.lng }
            }))
        }
    });
});

// Whatsapp Cloud API integration for Notification

app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { phone, templateName, parameters } = req.body;

    // Validate input
    if (!phone) {
      return res.status(400).json({ 
        error: 'Phone number is required' 
      });
    }

    // Remove + and spaces from phone number
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    console.log('Sending WhatsApp to:', cleanPhone);

    // Meta WhatsApp Cloud API endpoint
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

    // Prepare message payload (using template)
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName || 'hello_world', // Default template
        language: {
          code: 'en_US'
        }
      }
    };

    // If parameters provided, add them to template
    if (parameters && parameters.length > 0) {
      messagePayload.template.components = [
        {
          type: 'body',
          parameters: parameters.map(param => ({
            type: 'text',
            text: param
          }))
        }
      ];
    }

    // Send WhatsApp message
    const response = await axios.post(url, messagePayload, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('WhatsApp sent successfully:', response.data);

    res.json({
      success: true,
      messageId: response.data.messages[0].id,
      message: 'WhatsApp message sent successfully'
    });

  } catch (error) {
    console.error('WhatsApp error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to send WhatsApp message',
      details: error.response?.data?.error || error.message,
      hint: 'Make sure you have approved template and valid phone number with opt-in'
    });
  }
});

// Payment Integration using Stripe
// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({ 
        error: 'Invalid amount. Amount must be at least 1.' 
      });
    }

    console.log('Creating payment intent for amount:', amount);

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses smallest currency unit (paise for INR)
      currency: 'inr', // Change to 'usd' if needed
      payment_method_types: ['card']
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent error:', error.message);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message
    });
  }
});

// Confirm Payment (for demo purposes)
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ 
        error: 'Payment Intent ID is required' 
      });
    }

    // Retrieve payment intent status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Payment confirmation error:', error.message);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});