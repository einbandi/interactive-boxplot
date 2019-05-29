import { min, max } from 'd3-array';
import { classList } from './index';

export interface IBoxData {
    classLabel: number | string;
    epoch: number;
    median: number;
    upperQuartile: number;
    lowerQuartile: number;
    upperWhisker: number;
    lowerWhisker: number;
}

class WhiskerBox implements IBoxData {

    classLabel: number | string;
    epoch: number;
    median: number;
    upperQuartile: number;
    lowerQuartile: number;
    upperWhisker: number;
    lowerWhisker: number;
    
    constructor(box: IBoxData) {
        this.classLabel = box.classLabel;
        this.epoch = box.epoch;
        this.median = box.median;
        this.upperQuartile = box.upperQuartile;
        this.lowerQuartile = box.lowerQuartile;
        this.upperWhisker = box.upperWhisker;
        this.lowerWhisker = box.lowerWhisker;
    }
}

// potentially remove classList member,
// and refer to classList of main data
export class PlottedWhiskerBox extends WhiskerBox {

    xPos: number;
    highlighted: boolean;
    classList: (number | string)[];

    constructor(box: IBoxData, xPos: number, classList: (number | string)[], highlighted: boolean = false) {
        super(box);
        this.xPos = xPos;
        this.classList = classList;
        this.highlighted = highlighted;
    }

    moveX(shift: number): void {
        this.xPos += shift;
    }

    toggleHighlight(): void {
        this.highlighted = !this.highlighted;
    }

    isLeftOf(classLabel: string | number): boolean {
        const selected = this.classList.indexOf(classLabel);
        const current = this.classList.indexOf(this.classLabel);
        if (selected == -1 || current == -1) {
            console.log('PlottedWhiskerBox::clbl');
            return false;
        }
        else if (current < selected) {
            return true;
        }
        else {
            return false;
        }
    }

    isRightOf(classLabel: string | number): boolean {
        const selected = this.classList.indexOf(classLabel);
        const current = this.classList.indexOf(this.classLabel);
        if (selected == -1 || current == -1) {
            console.log('PlottedWhiskerBox::clbl');
            return false;
        }
        else if (current > selected) {
            return true;
        }
        else {
            return false;
        }
    }
}

export class BoxPlotData {

    data: IBoxData[];

    constructor(data: IBoxData[]) {
        this.data = data;
    }

    getBoxesByClass(classLabel: number | string): IBoxData[] {
        const filtered: IBoxData[] = this.data.filter(function (box: IBoxData) {
            return box.classLabel == classLabel;
        });
        return filtered.sort(function (a, b) {
            return a.epoch - b.epoch;
        });
    }

    getBoxesByEpoch(epoch: number): IBoxData[] {
        return this.data.filter(function (box: IBoxData) {
            return box.epoch == epoch;
        });
    }

    getBoxByClassAndEpoch(classLabel: number | string, epoch: number): IBoxData {
        return this.data.filter(function (box: IBoxData) {
            return box.classLabel == classLabel && box.epoch == epoch;
        })[0];
    }

    filter(selectedClasses: (number | string)[], selectedEpoch: number) {
        const filtered: IBoxData[] = [];
        const outerThis = this;
        classList.forEach(function (c) {
            if (selectedClasses.indexOf(c) != -1) {
                outerThis.getBoxesByClass(c).forEach(function (b) {
                    filtered.push(b);
                });
            }
            else {
                filtered.push(outerThis.getBoxByClassAndEpoch(c, selectedEpoch));
            }
        });
        return filtered;
    }

    yRange(): number[] {
        let minimum = min(this.data, function (d) {
            return d.lowerWhisker;
        });
        if (minimum == null) {
            minimum = 0;
        }
        let maximum = max(this.data, function (d) {
            return d.upperWhisker;
        });
        if (maximum == null) {
            maximum = 0;
        }
        return [minimum, maximum];
    }
}

export interface IBoxOptions {
    gapHeight: number;
    boxWidth: number;
    whiskerWidth: number;
}