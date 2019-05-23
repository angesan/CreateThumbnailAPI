db.createUser(
    {
        user: "genki",
        pwd: "abcdefg123",
        roles: [
            {
                role: "readWrite",
                db: "imagestate"
            }
        ]
    }
);