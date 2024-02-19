import { _decorator } from 'cc';

export class UserConfig {
    private mapData: { [key: string]: number[][] } = {}  //关卡位置数据   关卡:[位置，图片类型]
    private mapDataPos: { [key: string]: number[][] } = {};   //关卡对应图片相交位置
    public setMapDateJson(data: any) {             //地图数据存本地
        this.mapData = data;
        //计算出对应位置备用
        for (let i in this.mapData) {
            let data = this.mapData[i];
            let map_data = [];
            for (let i = 0; i < data.length; i++) {
                map_data.push(this.getPos(data[i][0]));
            }
            this.mapDataPos['map_' + i] = map_data;
        }
    }
    public getMapData() {
        return this.mapData;
    }
    public getMapDataPos() {
        return this.mapDataPos;
    }
    public setMapData(key: number, data: number[][]) {
        this.mapData[key.toString()] = data;
        let map_data = [];
        for (let i = 0; i < data.length; i++) {
            map_data.push(this.getPos(data[i][0]));
        }
        this.mapDataPos['map_' + key] = map_data;
        localStorage.setItem('map', JSON.stringify(this.mapData));
    }
    //    //获取相交坐标
    public getPos(index: number) {
        let arrIndex: number[] = [];  //相交位置
        if (!Math.floor(index % 15)) {                //最左边
            arrIndex.push(index + 1);
            if (!Math.floor(index / 15)) {            //上面
                arrIndex.push(index + 15, index + 16);
            } else if (Math.floor(index / 15) >= 14) {   //下面
                arrIndex.push(index - 15, index - 14);
            } else {                                //中间
                arrIndex.push(index + 15, index + 16, index - 15, index - 14);
            }
        } else if (!Math.floor((index + 1) % 15)) {       //最右边
            arrIndex.push(index - 1);
            if (!Math.floor(index / 15)) {            //上面
                arrIndex.push(index + 15, index + 14);
            } else if (Math.floor(index / 15) >= 14) {   //下面
                arrIndex.push(index - 15, index - 16);
            } else {                                //中间
                arrIndex.push(index + 15, index + 14, index - 15, index - 16);
            }
        } else {
            arrIndex.push(index + 1, index - 1);        //中间
            if (!Math.floor(index / 15)) {            //上面
                arrIndex.push(index + 15, index + 14, index + 16);
            } else if (Math.floor(index / 15) >= 14) {   //下面
                arrIndex.push(index - 15, index - 16, index - 14);
            } else {                                //中间
                arrIndex.push(index + 15, index + 14, index + 16, index - 15, index - 16, index - 14);
            }
        }
        return arrIndex;
    }
}


export let userconfig: UserConfig = new UserConfig()
