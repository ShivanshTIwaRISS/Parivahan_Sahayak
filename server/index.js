import app from './app.js'
const port = process.env.PORT || 8787
app.listen(port, () => console.log(`Mock API listening on http://localhost:${port}`))
