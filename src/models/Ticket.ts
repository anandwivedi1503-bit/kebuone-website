import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    ticketId: String,

    userId: String,

    tripId: String,

    category: {
      type: String,
      default: "UNLOCK_ISSUE",
    },

    description: String,

    status: {
      type: String,
      default: "OPEN",
    },

    assignedTo: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Ticket ||
  mongoose.model("Ticket", TicketSchema);