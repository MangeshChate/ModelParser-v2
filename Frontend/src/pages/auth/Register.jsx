// components/RegisterPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Register() {
  return (
    <div className="flex min-h-screen">
      {/* Left Section - Abstract Blue Images */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-12 bg-white">
        <div className="grid grid-cols-2 gap-6">
          <img
            src="./1.jpeg"
            alt="Abstract 1"
            className="rounded-xl rounded-t-[50%] shadow-lg hover:scale-105 transition-transform duration-300 border border-blue-200"
            style={{ boxShadow: "0 4px 30px rgba(0, 118, 255, 0.25)" }}
          />
          <img
            src="./2.jpeg"
            alt="Abstract 2"
            className="rounded-xl rounded-r-[50%] shadow-lg hover:scale-105 transition-transform duration-300 border border-blue-200"
            style={{ boxShadow: "0 4px 30px rgba(0, 118, 255, 0.25)" }}
          />
          <img
            src="./3.jpeg"
            alt="Abstract 3"
            className="rounded-xl rounded-l-[50%] shadow-lg hover:scale-105 transition-transform duration-300 border border-blue-200"
            style={{ boxShadow: "0 4px 30px rgba(0, 118, 255, 0.25)" }}
          />
          <img
            src="./4.jpeg"
            alt="Abstract 4"
            className="rounded-xl rounded-b-[50%] shadow-lg hover:scale-105 transition-transform duration-300 border border-blue-200"
            style={{ boxShadow: "0 4px 30px rgba(0, 118, 255, 0.25)" }}
          />
        </div>
      </div>

      {/* Right Section - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6">
        <Card className="w-full max-w-lg min-h-[500px] p-6 border border-gray-200 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Create Account
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Fill the form to register
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2">
                Register
              </Button>
              <p className="text-sm text-center mt-2 text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="underline text-primary">
                  Sign in
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
