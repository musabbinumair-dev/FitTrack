import mongoose from "mongoose";

const measurementsSchema = new mongoose.Schema(
  {
    chest: { type: Number, default: 0 },
    waist: { type: Number, default: 0 },
    hips: { type: Number, default: 0 },
    arms: { type: Number, default: 0 },
    thighs: { type: Number, default: 0 }
  },
  { _id: false }
);

const performanceMetricsSchema = new mongoose.Schema(
  {
    runTimeSeconds: { type: Number, default: 0 },
    maxLiftKg: { type: Number, default: 0 }
  },
  { _id: false }
);

const bodyMetricSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    weight: { type: Number },
    measurements: measurementsSchema,
    performanceMetrics: performanceMetricsSchema
  },
  { timestamps: true, collection: "bodymetrics" }
);

bodyMetricSchema.index({ userId: 1, date: 1 }, { unique: true });

const BodyMetric = mongoose.model("BodyMetric", bodyMetricSchema);

export default BodyMetric;
