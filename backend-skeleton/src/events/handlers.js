const { eventBus } = require("./bus");
const { createNotification } = require("../services/notification.service");
const { findNearbyReceivers } = require("../services/proximity.service");

function registerEventHandlers() {
  eventBus.on("donation.created", async (payload) => {
    const { donationId, foodName, lng, lat } = payload;
    if (Number.isNaN(lng) || Number.isNaN(lat)) return;

    const receivers = await findNearbyReceivers(lng, lat, 10000);
    await Promise.all(
      receivers.map((user) =>
        createNotification({
          userId: user._id,
          type: "donation_nearby",
          title: "New food donation near you",
          body: `${foodName} is available nearby.`,
          data: { donationId },
        })
      )
    );
  });

  eventBus.on("request.created", async ({ donorId, requestId, foodName }) => {
    await createNotification({
      userId: donorId,
      type: "request_received",
      title: "New request received",
      body: `A receiver requested ${foodName}.`,
      data: { requestId },
    });
  });

  eventBus.on("request.updated", async ({ receiverId, requestId, status }) => {
    await createNotification({
      userId: receiverId,
      type: "request_status_updated",
      title: "Request status updated",
      body: `Your request was ${status}.`,
      data: { requestId, status },
    });
  });

  eventBus.on("feedback.created", async ({ donorId, feedbackId }) => {
    await createNotification({
      userId: donorId,
      type: "feedback_received",
      title: "New feedback received",
      body: "A receiver submitted feedback for your donation.",
      data: { feedbackId },
    });
  });
}

module.exports = { registerEventHandlers };

