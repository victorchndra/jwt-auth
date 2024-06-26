import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // di split krn terdapat bearer dan token, dan kita mau ambil tokennya
    // jika user tidak mengirimkan token, var token akan kosong, jika ada isi maka ambil tokennya
    const token = authHeader && authHeader.split(' ')[1]; 
    if(token == null)
        return res.sendStatus(401); //unauthorized. sendStatus krn tidak ingin mengirimkan pesan lagi
    // verif token, par2 itu secret key nya
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) 
            return res.sendStatus(403); //forbidden
        req.email = decoded.email; //krn kita menyertakan email di dalam tokennya, jd kita punya var email di dalam decoded token
        next();
    })
}