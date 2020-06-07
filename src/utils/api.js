export const fetchData = async (url) => {
    return new Promise((resolve, reject) => {
        fetch(url).then(
            response => {
                if (!response.ok) {
                    throw new Error();
                } else {
                    resolve(response.json())
                }
            }
        ).catch(error => {
            reject();
        })

        setTimeout(() => {
            reject();
        }, 3000)

    })
}