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

  eventBus.on("feedback.created", async ({ donorId, feedbackId, requestId, isDeliveryConfirmation }) => {
    await createNotification({
      userId: donorId,
      type: isDeliveryConfirmation ? "delivery_confirmed_by_receiver" : "feedback_received",
      title: isDeliveryConfirmation ? "Delivery confirmed by receiver" : "New feedback received",
      body: isDeliveryConfirmation
        ? "Receiver confirmed the food was delivered successfully."
        : "A receiver submitted feedback for your donation.",
      data: { feedbackId, requestId: requestId || "" },
    });
  });

  eventBus.on("mission.accepted", async ({ donorId, receiverId, requestId }) => {
    await Promise.all([
      createNotification({
        userId: donorId,
        type: "mission_accepted",
        title: "Volunteer assigned",
        body: "A volunteer accepted your delivery request.",
        data: { requestId },
      }),
      createNotification({
        userId: receiverId,
        type: "mission_accepted",
        title: "Delivery volunteer assigned",
        body: "A volunteer accepted your mission and will deliver your food.",
        data: { requestId },
      }),
    ]);
  });

  eventBus.on("mission.delivered", async ({ donorId, receiverId, requestId }) => {
    await Promise.all([
      createNotification({
        userId: donorId,
        type: "mission_delivered",
        title: "Delivery completed",
        body: "Your donation was delivered successfully.",
        data: { requestId },
      }),
      createNotification({
        userId: receiverId,
        type: "mission_delivered",
        title: "Food delivered",
        body: "Your food delivery was completed successfully.",
        data: { requestId },
      }),
    ]);
  });
}

module.exports = { registerEventHandlers };
