export default function* generator(initValue = 0) {
    let index = initValue;
    while(true) {
        yield index++;
    }
}