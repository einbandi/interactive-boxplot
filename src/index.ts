import './assets/scss/style.scss';

import { select } from 'd3-selection';
import 'd3-transition';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

import test_data from './assets/json/boxpl-909.json';
import { BoxPlotData, IBoxData, PlottedWhiskerBox, IBoxOptions } from './IBoxData';

// classList should be tied to main data
export const classList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const data = new BoxPlotData(test_data);



// options  for standard whisker box
const standardBox: IBoxOptions = {
    gapHeight: 3,
    boxWidth: 8,
    whiskerWidth: 3
};

// potentially style 'grayed out' boxes differently
// const otherBox: IBoxOptions = {
//     gapHeight: 3,
//     boxWidth: 4,
//     whiskerWidth: 2
// };

const boxPlotOptions = {
    withinClassSep: 6,
    betweenClassSep: 12
};

// path generator for whisker box
// standardBox is default for box options, but can be given separately
function boxToPath(box: IBoxData, x0: number, yScale: (x: number) => number, opts: IBoxOptions = standardBox) {
    const x1 = x0 - opts.boxWidth / 2;
    const x2 = x0 - opts.whiskerWidth / 2;
    const x3 = x0 + opts.whiskerWidth / 2;
    const x4 = x0 + opts.boxWidth / 2;

    const yu1 = yScale(box.median) - opts.gapHeight / 2;
    const yu2 = yScale(box.upperQuartile);
    const yu3 = yScale(box.upperWhisker);

    const yl1 = yScale(box.median) + opts.gapHeight / 2;
    const yl2 = yScale(box.lowerQuartile);
    const yl3 = yScale(box.lowerWhisker);

    let upperPath: string = `M${x1} ${yu1} L${x1} ${yu2} L${x2} ${yu2}`
    upperPath += `L${x2} ${yu3} L${x3} ${yu3} L${x3} ${yu2} L${x4} ${yu2} L${x4} ${yu1} Z`;

    let lowerPath: string = `M${x1} ${yl1} L${x4} ${yl1} L${x4} ${yl2}`
    lowerPath += `L${x3} ${yl2} L${x3} ${yl3} L${x2} ${yl3} L${x2} ${yl2} L${x1} ${yl2} Z`;

    return `${upperPath} ${lowerPath}`;
}

// should be replaced by epoch data from main data.
// instead of only referring to maxEpochs, it should
// refer to selected epoch range in full app
const maxEpochs = 14;

const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
    inner: 10
}
const width = 2 * ((maxEpochs * (classList.length + 1)) * (standardBox.boxWidth + boxPlotOptions.withinClassSep) +
    (classList.length - 1) * boxPlotOptions.betweenClassSep - margin.left - margin.right);
const height = 500 - margin.top - margin.bottom;

// setup y for input plot
const yScale = scaleLinear().domain(data.yRange()).range([height, 0]);

// color scale already exists in full app
const color = scaleOrdinal(schemeCategory10);

// standard svg setup
const svg = select('body')
    .append('div')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// selected epoch should be tied to input field
// (maybe that of projection plot)
let selectedClasses: (number | string)[] = [];
let selectedEpoch: number = 5;

// initial filtered boxes
let filtered = data.filter(selectedClasses, selectedEpoch);

// boxes container is changed by user interaction
// and used to redraw every time
let boxes: PlottedWhiskerBox[] = [];
filtered.forEach(function (box, i) {
    // initial 'zero' position might have to be improved
    // depending on how svg width is chosen
    boxes.push(new PlottedWhiskerBox(box, width * selectedEpoch / (maxEpochs) - classList.length / 2 *
        (boxPlotOptions.betweenClassSep + standardBox.boxWidth) +
        i * (boxPlotOptions.betweenClassSep + standardBox.boxWidth), classList, true))
})

function makeBoxPlot() {
    let boxPaths = svg.selectAll('path');
    boxPaths.data(boxes)
        .enter()
        .append('path')
        .merge(<any>boxPaths)
        .on('click', function (d) {
            let clickedClassIndex = selectedClasses.indexOf(d.classLabel);
            if (clickedClassIndex == -1) {
                // if class was not previously selected
                // add class to selecition
                selectedClasses.push(d.classLabel);
                boxes.forEach(function (box) {
                    if (box.isLeftOf(d.classLabel)) {
                        // push left boxes to the left
                        box.moveX(- selectedEpoch * (boxPlotOptions.withinClassSep + standardBox.boxWidth));
                    } else if (box.isRightOf(d.classLabel)) {
                        // and right boxes to the right
                        box.moveX((maxEpochs - selectedEpoch) * (boxPlotOptions.withinClassSep + standardBox.boxWidth))
                    }
                })
                data.getBoxesByClass(d.classLabel).forEach(function (box) {
                    // get boxes for other epochs of same class
                    if (box.epoch != d.epoch) {
                        const x = d.xPos + (box.epoch - d.epoch) * (standardBox.boxWidth + boxPlotOptions.withinClassSep);
                        boxes.push(new PlottedWhiskerBox(box, x, classList, false));
                    }
                });
                // update plot
                makeBoxPlot();
            } else if (selectedEpoch == d.epoch) {
                // if class was selected and highlighted epoch is clicked
                // remove class from selection
                selectedClasses = selectedClasses.filter(function (c) {
                    return c != d.classLabel;
                })
                boxes.forEach(function (box) {
                    if (box.isLeftOf(d.classLabel)) {
                        // move left boxes back to the right
                        box.moveX(selectedEpoch * (boxPlotOptions.withinClassSep + standardBox.boxWidth));
                    } else if (box.isRightOf(d.classLabel)) {
                        // move right boxes back to the left
                        box.moveX(- (maxEpochs - selectedEpoch) * (boxPlotOptions.withinClassSep + standardBox.boxWidth))
                    }
                });
                // remove all boxes from same class but different epoch
                boxes = boxes.filter(function (box) {
                    return box.classLabel != d.classLabel ||
                        box.epoch == selectedEpoch;
                });
                // do the same in svg (careful, negated logic!)
                svg.selectAll('.whiskerBox')
                    .each(function (box: any) {
                        if (box.classLabel == d.classLabel &&
                            box.epoch != selectedEpoch) {
                            select(this)
                                .remove();
                        }
                    });
                // update plot
                makeBoxPlot();
            } else {
                // if class was selected and different epoch is clicked
                // select clicked epoch
                selectedEpoch = d.epoch;
                boxes.forEach(function (box, i) {
                    if (selectedClasses.indexOf(box.classLabel) != -1) {
                        // change highlighted epoch in all selected classes
                        if (box.highlighted || box.epoch == d.epoch) {
                            box.toggleHighlight();
                        }
                    } else {
                        // change all non-selected classes to selected epoch
                        boxes[i] = new PlottedWhiskerBox(data.getBoxByClassAndEpoch(box.classLabel, selectedEpoch),
                            box.xPos, box.classList, box.highlighted);
                    }
                });
                // update plot
                makeBoxPlot();
            };
        })
        .classed('whiskerBox', true)
        .style('opacity', function (d) {
            return d.highlighted ? 1 : 0.2;
        })
        .transition()
        .duration(100)
        .attr('d', function (d) {
            return boxToPath(d, d.xPos, yScale);
        })
        .attr('fill', function (d) {
            return color(d.classLabel.toString());
        });
}

makeBoxPlot();