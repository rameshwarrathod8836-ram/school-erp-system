<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            "email" => "required|email",
            "password" => "required",
        ]);

        $user = User::where("email", $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(["message" => "???? ????? ??????? ?????? ???."], 401);
        }

        $token = $user->createToken("auth_token")->plainTextToken;

        return response()->json([
            "message" => "????? ??????!",
            "token" => $token,
            "user" => [
                "id" => $user->id,
                "name" => $user->name,
                "email" => $user->email,
                "school_id" => $user->school_id ?? 1,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(["message" => "?????? ??????!"]);
    }
}

