const { eventBus } = require("./bus");
const { createNotification } = require("../services/notification.service");
const { findNearbyReceivers, findNearbyVolunteers } = require("../services/proximity.service");

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

  eventBus.on("request.created", async ({ donorId, requestId, foodName, logistics, donationId }) => {
    await createNotification({
      receiverUserId: donorId,
      type: logistics === "delivery" ? "delivery_requested" : "request_received",
      title: logistics === "delivery" ? "Delivery request received" : "New request received",
      message:
        logistics === "delivery"
          ? "Receiver has requested delivery for your donation."
          : `A receiver requested ${foodName}.`,
      body:
        logistics === "delivery"
          ? "Receiver has requested delivery for your donation."
          : `A receiver requested ${foodName}.`,
      relatedDonationId: donationId || null,
      data: { requestId, donationId: donationId || null },
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
      receiverUserId: donorId,
      type: isDeliveryConfirmation ? "delivery_confirmed_by_receiver" : "feedback_received",
      title: isDeliveryConfirmation ? "Delivery confirmed by receiver" : "New feedback received",
      message: isDeliveryConfirmation
        ? "Receiver confirmed the food was delivered successfully."
        : "A receiver submitted feedback for your donation.",
      body: isDeliveryConfirmation
        ? "Receiver confirmed the food was delivered successfully."
        : "A receiver submitted feedback for your donation.",
      data: { feedbackId, requestId: requestId || "" },
    });
  });

  eventBus.on(
    "delivery.request.approved",
    async ({ requestId, donationId, city, state, lng, lat }) => {
      const volunteers = await findNearbyVolunteers({ lng, lat, city, state, radiusMeters: 15000 });
      await Promise.all(
        volunteers.map((volunteer) =>
          createNotification({
            receiverUserId: volunteer._id,
            type: "delivery_mission_available",
            title: "New delivery mission available",
            message: "New delivery mission available. Please accept.",
            body: "New delivery mission available. Please accept.",
            relatedDonationId: donationId || null,
            data: { requestId, donationId: donationId || null },
          })
        )
      );
    }
  );

  eventBus.on("mission.accepted", async ({ donorId, receiverId, requestId }) => {
    await Promise.all([
      createNotification({
        receiverUserId: donorId,
        type: "mission_accepted",
        title: "Volunteer accepted delivery",
        message: "Volunteer has accepted the delivery.",
        body: "Volunteer has accepted the delivery.",
        data: { requestId },
      }),
      createNotification({
        receiverUserId: receiverId,
        type: "mission_accepted",
        title: "Volunteer accepted delivery",
        message: "Volunteer has accepted the delivery.",
        body: "Volunteer has accepted the delivery.",
        data: { requestId },
      }),
    ]);
  });

  eventBus.on("mission.delivered", async ({ donorId, receiverId, requestId }) => {
    await Promise.all([
      createNotification({
        receiverUserId: donorId,
        type: "mission_delivered",
        title: "Delivery completed",
        message: "Delivery successfully completed.",
        body: "Delivery successfully completed.",
        data: { requestId },
      }),
      createNotification({
        receiverUserId: receiverId,
        type: "mission_delivered",
        title: "Delivery completed",
        message: "Delivery successfully completed.",
        body: "Delivery successfully completed.",
        data: { requestId },
      }),
    ]);
  });
}

module.exports = { registerEventHandlers };
