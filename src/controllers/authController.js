import { promiseHandler } from "#helpers/promiseHandler";
import { successResponse, ErrorResponse } from "#helpers/response";
import userModel from "#models/user";

export const register = promiseHandler(async (req, res) => {
  const user = await userModel.create(req.body);
  const token = user.generateAccessToken();
  res
    .status(200)
    .json(
      new successResponse(200, "User Registered Successfully", { user, token })
    );
});

export const logout=promiseHandler(async(req,res)=>{

  await userModel.findByIdAndUpdate(
    req.user._id,
    {
        $unset: {
            refreshToken: 1 // this removes the field from document
        }
    },
    {
        new: true
    }
)

})