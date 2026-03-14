const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Start background workers
require("./services/cronService").startCronJobs();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  const body = { ...req.body };
  if (body.password) body.password = "********";
  console.log(
    `[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`,
    body,
  );
  next();
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const petRoutes = require("./routes/petRoutes");
const vetRoutes = require("./routes/vetRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const lostPetRoutes = require("./routes/lostPetRoutes");
const communityRoutes = require("./routes/communityRoutes");
const adminRoutes = require("./routes/adminRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const aiRoutes = require("./routes/aiRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/vets", vetRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/lostpets", lostPetRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Pet Care API is running...");
});

const PORT = process.env.PORT || 5000;
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible to routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
