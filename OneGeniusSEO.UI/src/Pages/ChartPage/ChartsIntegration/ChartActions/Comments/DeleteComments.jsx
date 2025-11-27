/**
 * yeh function commnets object aur ek chartId leta hai,
 * aur ek naya object return karta hai jismein se woh chartId waala comment hata diya gaya ho.
 * @param {object} allCommnets - Saare comments ka current object,
 * @param {string} chartIdToDelete- jo commnets delete larne haiushki ID,
 * @returns {object} - Naya Commnets objects bina delete kiye gaye commnet ke.
 */


export const  deleteCommentLogic = (allComments, chartIdToDelete) => {

    const newComments = {...allComments};

    delete newComments[chartIdToDelete];

    return newComments;
}