import { app } from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Producer service is running on port ${PORT}`);
});

