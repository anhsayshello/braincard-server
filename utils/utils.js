import { CardStatus } from "../constants/enum.js";

export const configureJSON = (schema) =>
  schema.set("toJSON", {
    virtuals: true,
    transform: (_document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
      // the passwordHash should not be revealed
      delete returnedObject.passwordHash;
    },
  });

// Helper function để tính toán thời gian review tiếp theo
export const calculateNextReview = (
  currentStatus,
  newStatus,
  reviewCount,
  currentInterval
) => {
  const now = new Date();
  let nextReview;
  let newInterval;

  // Lần đầu tiên review (từ forget -> status khác)
  if (reviewCount === 0) {
    switch (newStatus) {
      case CardStatus.Forget:
        nextReview = new Date(now.getTime() + 10 * 60 * 1000); // 10 phút
        newInterval = 0;
        break;
      case CardStatus.Hard:
        nextReview = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 ngày
        newInterval = 2;
        break;
      case CardStatus.Good:
        nextReview = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 ngày
        newInterval = 3;
        break;
      case CardStatus.Easy:
        nextReview = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 ngày
        newInterval = 4;
        break;
      default:
        nextReview = new Date(now.getTime() + 60 * 1000); // 1 phút
        newInterval = 0;
    }
  } else {
    // Từ lần review thứ 2 trở đi - SỬ DỤNG currentStatus
    switch (newStatus) {
      case CardStatus.Forget:
        // Forget luôn là 10 phút, reset interval
        nextReview = new Date(now.getTime() + 10 * 60 * 1000);
        newInterval = 0;
        break;
      case CardStatus.Hard:
        // Hard: logic khác nhau tùy currentStatus
        if (currentStatus === CardStatus.Forget) {
          // Từ FORGET lên HARD: reward tiến bộ
          newInterval = Math.max(1, currentInterval + 1);
        } else {
          // Từ GOOD/EASY xuống HARD: giữ nguyên (không penalty quá nặng)
          newInterval = currentInterval;
        }
        nextReview = new Date(
          now.getTime() + newInterval * 24 * 60 * 60 * 1000
        );
        break;
      case CardStatus.Good:
        // Good: logic khác nhau tùy currentStatus
        if (currentStatus === CardStatus.Forget) {
          // Từ FORGET lên GOOD: tăng ít (vừa học lại)
          newInterval = currentInterval + 1;
        } else if (currentStatus === CardStatus.Hard) {
          // Từ HARD lên GOOD: tăng bình thường
          newInterval = currentInterval + 2;
        } else {
          // Từ GOOD/EASY giữ GOOD: tăng bình thường
          newInterval = currentInterval + 2;
        }
        nextReview = new Date(
          now.getTime() + newInterval * 24 * 60 * 60 * 1000
        );
        break;
      case CardStatus.Easy:
        // Easy: bonus tùy currentStatus
        if (currentStatus === CardStatus.Easy) {
          // Liên tiếp EASY: bonus lớn (streak reward)
          newInterval = currentInterval + 4;
        } else if (currentStatus === CardStatus.Good) {
          // Từ GOOD lên EASY: thưởng progression
          newInterval = currentInterval + 3;
        } else {
          // Từ FORGET/HARD lên EASY: thưởng ít hơn
          newInterval = currentInterval + 2;
        }
        nextReview = new Date(
          now.getTime() + newInterval * 24 * 60 * 60 * 1000
        );
        break;
      default:
        nextReview = new Date(
          now.getTime() + currentInterval * 24 * 60 * 60 * 1000
        );
        newInterval = currentInterval;
    }
  }

  return { nextReview, newInterval };
};

// Helper function để validate status
export const isValidStatus = (status) => {
  return Object.values(CardStatus).includes(Number(status));
};

// Helper function để format response với thông tin hiển thị
export const formatCardResponse = (card) => {
  // Tính thời gian còn lại đến lần review tiếp theo
  const now = new Date();
  const nextReview = new Date(card.nextReview);
  const timeDiff = nextReview.getTime() - now.getTime();

  let timeUntilReview;
  if (timeDiff <= 0) {
    timeUntilReview = "Ready to review";
  } else {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    // Format theo status: Forget hiển thị phút, các status khác hiển thị ngày
    if (card.status === CardStatus.Forget) {
      // Forget: chỉ hiển thị phút
      if (minutes <= 1) {
        timeUntilReview = "Review in 1 minute";
      } else {
        timeUntilReview = `Review in ${minutes} minutes`;
      }
    } else {
      // Hard, Good, Easy: chỉ hiển thị ngày
      if (days <= 0) {
        timeUntilReview = "Review in 1 day"; // Nếu chưa đến 1 ngày thì hiển thị 1 day
      } else if (days === 1) {
        timeUntilReview = "Review in 1 day";
      } else {
        timeUntilReview = `Review in ${days} days`;
      }
    }
  }

  return {
    id: card._id,
    frontCard: card.frontCard,
    backCard: card.backCard,
    status: card.status,
    timeUntilReview,
    isReadyForReview: timeDiff <= 0,
    nextReview: card.nextReview,
    deckId: card.deckId,
    reviewCount: card.reviewCount,
    forgetCount: card.forgetCount,
    interval: card.interval,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
};

export const getTokenFrom = (req) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

export default {
  configureJSON,
  isValidStatus,
  calculateNextReview,
  formatCardResponse,
  getTokenFrom,
};
