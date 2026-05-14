import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️  Google OAuth credentials not configured. Google login will be disabled.");
}

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user.ID);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.nguoidung.findUnique({
      where: { ID: id },
      include: { roles: true },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;
          const googleId = profile.id;

          if (!email) {
            return done(new Error("No email from Google"), null);
          }

          // Tìm user theo email
          let user = await prisma.nguoidung.findUnique({
            where: { Email: email },
            include: { roles: true },
          });

          if (user) {
            // User đã tồn tại, return luôn
            return done(null, user);
          }

          // Tạo user mới với role NguoiThue
          const roleNguoiThue = await prisma.roles.findUnique({
            where: { TenVaiTro: "NguoiThue" },
          });

          if (!roleNguoiThue) {
            return done(new Error("Role NguoiThue not found"), null);
          }

          // Tạo username từ email (phần trước @)
          let username = email.split("@")[0];
          
          // Kiểm tra username đã tồn tại chưa, nếu có thì thêm số
          let usernameExists = await prisma.nguoidung.findUnique({
            where: { TenDangNhap: username },
          });
          
          let counter = 1;
          while (usernameExists) {
            username = `${email.split("@")[0]}${counter}`;
            usernameExists = await prisma.nguoidung.findUnique({
              where: { TenDangNhap: username },
            });
            counter++;
          }

          user = await prisma.nguoidung.create({
            data: {
              TenDangNhap: username,
              Email: email,
              HoTen: name || email,
              MatKhau: "", // Google user không cần password
              RoleID: roleNguoiThue.ID,
              TrangThai: "Active",
            },
            include: { roles: true },
          });
          return done(null, user);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error, null);
        }
      }
    )
  );
}

export default passport;
