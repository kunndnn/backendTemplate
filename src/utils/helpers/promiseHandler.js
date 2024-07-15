import { ErrorSend } from "#helpers/response";
export const promiseHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
  // Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));

  // Promise.resolve(requestHandler(req, res, next)).catch((err) => {
  //   return res.status(500).json(new ErrorSend(500, err.message, {}));
  // });
};

// const promiseHandler = () => {}
// const promiseHandler = (func) => () => {}
// const promiseHandler = (func) => async () => {}
// const promiseHandler = (func) =>{ async () => {}}

// export const promiseHandler = (requestHandler) => async (req, res, next) => {
//   try {
//     await requestHandler(req, res, next);
//   } catch (error) {
//     next(error);
//   }
// };
