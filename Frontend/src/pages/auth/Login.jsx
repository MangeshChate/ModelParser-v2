import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleForm = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        username: name,
        password: password,
      });
      
      const { token } = response.data;
      console.log("Login successful. Token:", token);
      localStorage.setItem("token", token);
      navigate('/dashboard')
    } catch (error) {
      if (error.response) {
        console.error("Login failed:", error.response.data.message);
        alert(error.response.data.message);
      } else {
        console.error("Network or server error:", error.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen">
     
      <div className="hidden lg:flex w-1/2  items-center justify-center p-12">
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

     
      <div className="w-full  lg:w-1/2 flex items-center justify-center  ">
        <Card className="w-full max-w-lg max-h-full    shadow-2xl ">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your credentials to sign in
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForm} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full mt-2">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
