export default isUserAdmin = (req)=>{
    const role=req.user.role

    if(role!=ADMIN)
    {
        return false
    }
    return true
}