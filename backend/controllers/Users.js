import Users from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getUsers = async(req, res) => {
    try {
        const users = await Users.findAll({
            attributes:['id','name','email']
        });
        res.json(users);
    } catch (error) {
        console.log(error);
    }
}

export const Register = async(req, res) => {
    const { name, email, password, confPassword } = req.body;
    if(password !== confPassword) 
        return res.status(400).json({msg: "Password dan Confirm Password tidak cocok"});
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
        await Users.create({
            name: name,
            email: email,
            password: hashPassword
        });
        res.json({msg: "Register Berhasil"});
    } catch (error) {
        console.log(error);
    }
}

export const Login = async(req, res) => {
    try {
        // Ambil data email dari tabel Users
        const user = await Users.findAll({
            where: {
                email: req.body.email
            }
        })
        // Validasi input password dari user dgn password dari database. user[0] karena single data
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if(!match) return res.status(400).json({msg: "Wrong Password"});
        // jika valid, data id, nama, email dari user disimpan ke dalam variabel
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        // variabel td digunakan untuk login menggunakan jwt
        // process.env.ACCESS_TOKEN_SECRET dan REFRESH diperoleh dari .env
        const accessToken = jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '20s'
        });
        const refreshToken = jwt.sign({userId, name, email}, process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: '1d'
        });
        // Simpan refresh token ke database. refresh_token-> dri database
        await Users.update({refresh_token: refreshToken}, {
            where:{
                id: userId
            }
        });
        // Mengirimkan HTTP only-cookie ke client
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, //24 jam (dalam milisecond)
            // secure: true, //gunakan ini jika menggunakan https
        });
        // Mengirimkan access token ke client
        res.json({ accessToken });
    } catch (error) {
        res.status(404).json({msg:"Email tidak ditemukan"});
    }
}

export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken; //ambil value dari token yang kita set di cookie
    if(!refreshToken)
        return res.sendStatus(204); // no content
    const user = await Users.findAll({ // cek token di atas dengan token di database
        where: {
            refresh_token: refreshToken
        }
    });
    if(!user[0])
        return res.sendStatus(204) // no content

    const userId = user[0].id;
    // update refresh token di database dan set menjadi null
    await Users.update({refresh_token: null},{
        where:{
            id: userId
        }
    });
    // hapus cookie. refreshToken -> nama cookie yang akan di clear
    res.clearCookie('refreshToken'); 
    return res.sendStatus(200);
}