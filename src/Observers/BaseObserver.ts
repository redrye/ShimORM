import IObserver from "@/Contracts/IObserver";

abstract class BaseObserver implements IObserver {


    static booting =  (model) => {
        console.log('Booting observed model')
    }
    static booted = (model) => {
        console.log('Booted observed model')
    }

}

export default BaseObserver