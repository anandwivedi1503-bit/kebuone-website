export const NOT_DELETED_FILTER = {
  $or: [
    { isDeleted: false },
    { isDeleted: { $exists: false } },
  ],
};
