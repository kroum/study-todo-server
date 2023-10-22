export default async (data) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data || null), Math.floor(Math.random() * 100));
    });
}
