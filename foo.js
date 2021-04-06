function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve("done!"), ms)
    });}

async function foo(){
    console.log("anan")
    await sleep(2000);
    return 0;
}

async function main(){
    await foo()
    console.log("3")
    console.log("5")
}

main()