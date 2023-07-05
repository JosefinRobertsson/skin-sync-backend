import User from "../Models/user"


const authenticateUser = async (req, res, next) => {
    const accessToken = req.header("Authorization");
    try {
      const user = await User.findOne({ accessToken: accessToken });
      if (user) {
        next();
      } else {
        res.status(403).json({
          success: false,
          response: null,
          message: "You must be logged in to see this page"
        });
      }
    } catch (e) {
      console.error("authenticateUser Error:", e);
      res.status(500).json({
        success: false,
        response: null,
        message: "Internal server error",
        error: e.errors
      });
    }
  };

  export default authenticateUser;