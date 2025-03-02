   const getISTTime = (date) => {
    return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  };
   const getUTCTime = (istDate) => {
    return new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
  };
  exports.getISTTime = getISTTime;
  exports.getUTCTime = getUTCTime;
