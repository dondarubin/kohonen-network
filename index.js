const width = 40, height = 40, widthNeuron = 10, heightNeuron = 10;
let canvas = document.querySelector("#canvas");
let context = canvas.getContext("2d");
let testData = [];

function random(min, max) {
    return (min + Math.random() * (max - min));
}

function trainingData() {
    // let step = 255;
    // for (let r = 0; r <= 255; r += step) {
    //     for (let g = 0; g <= 255; g += step) {
    //         for (let b = 0; b <= 255; b += step) {
    //             testData.push([r / 255, g / 255, b / 255]);
    //         }
    //     }
    // }

    testData = [
        [255 / 255, 0, 0],          // красный
        [255 / 255, 102 / 255, 0],  // оранжевый
        [255 / 255, 255 / 255, 0],  // жетлый
        [0, 255 / 255, 0],          // зеленый
        [0, 0, 255 / 255],          // синий
        [128 / 255, 0, 128 / 255],  // фиолетовый
    ]
}


class Neuron {
    constructor(X, x, y) {
        this.x = x;
        this.y = y;
        this.weights = Array(X).fill(0).map(value => random(0, 1));  // рандомные веса
        this.color = "rgb(255,255,255)";                                  // цвет нейрона
    }

    render() {
        // Отображение нейрона на сетке
        context.fillStyle = this.color                                  // цвет нейрона
        context.clearRect(this.x, this.y, widthNeuron, heightNeuron);   // очистка пространства
        context.fillRect(this.x, this.y, widthNeuron, heightNeuron);    // Прорисовка нейрона
    }

    recolor() {
        // Изменяет цвет нейрона на сетке
        this.color = "rgb(" +
            this.weights[0] * 255 + "," +
            this.weights[1] * 255 + "," +
            this.weights[2] * 255 +
            ")";
        this.render()
    }
}

class SOM {
    // n = количество входных воздействий
    constructor(n) {
        this.neurons = [];
        this.x = 1;
        this.y = 1;
        this.sigma0 = Math.max(width * widthNeuron, height * heightNeuron) / 2;
        this.lambda = 0;
        this.sigma = 0;
        this.L = 0;
        this.theta = 0;
        this.r = 0;
        this.neighbors = [];

        // Прорисовка нейронов
        for (let i = 0; i < width * height; i++) {
            this.neurons.push(new Neuron(n, this.x, this.y))
            if (this.x + widthNeuron < width * widthNeuron) {
                this.x += widthNeuron + 1;
            } else {
                this.x = 1;
                this.y += widthNeuron + 1;
            }

        }
        this.neurons.forEach(neuron => neuron.render())
    }


    recolor() {
        this.neurons.forEach(value => value.recolor())
    }

    indexMinimum(D) {
        // Определение минимального значения из массива расстояний
        let index = 0, min = D[index];
        for (let i = 1; i < D.length; i++) {
            if (D[i] < min) {
                index = i;
                min = D[i];
            }
        }
        return index;
    }

    neuronWinner(y) {
        // Определение нейрона победителя (y = входной слой)
        this.D = [];        // массив растояний между входными данными и нейронами
        this.neurons.forEach((neuron, indexNeuron) => {
            this.s = 0;
            y.forEach((input, indexInput) => {
                    this.s += (input - neuron.weights[indexInput]) ** 2;
                }
            )
            this.D.push(Math.sqrt(this.s));
        })
        return this.indexMinimum(this.D); // Возвращение индекса победившего нейрона
    }

    search(y) {
        // прописовка нейронов победителей (y = входной слой)
        this.neurons.forEach(value => {
            value.color = "rgb(255,255,255)";
            value.render()
        }) // очищение цвета сетки

        y.forEach(value => this.neurons[this.neuronWinner(value)].recolor())   //Красим только нейроны победители
    }

    learn(T = 1, L0 = 0.33) {
        // обучение (T - количество итераций, L0 - скорость обучения)
        this.lambda = T / Math.log(this.sigma0);
        testData.forEach((value, indexValue) => {
            this.currentWinner = this.neurons[this.neuronWinner(value)]

            for (let t = 0; t < T; t++) {                                 //Обучаем T раз на каждом примере
                this.sigma = this.sigma0 * Math.exp(-(t / this.lambda))

                this.L = L0 * Math.exp(-(t / this.lambda))              //Вычисляем коэффициент скорости обучения

                this.neighbors = this.neurons.filter(neuron =>            // массив соседих элементов
                    Math.sqrt((neuron.x - this.currentWinner.x) ** 2 + (neuron.y - this.currentWinner.y) ** 2)
                    < this.sigma);

                this.neighbors.forEach((neuron, indexNeuron) => {  //Пробегаемся по всем соседям
                    //Узнаем расстояние до каждого соседа
                    this.r = Math.sqrt((neuron.x - this.currentWinner.x) ** 2 + (neuron.y - this.currentWinner.y) ** 2)
                    this.theta = Math.exp(-((this.r ** 2) / (2 * (this.sigma ** 2))))       // плотность обучения

                    neuron.weights.forEach((weight, indexWeight) => {           //Пробегаемся по всем весовым коэффициентам соседа
                        this.neighbors[indexNeuron].weights[indexWeight] += this.theta * this.L * (value[indexWeight] - weight); //Корректируем весовые коэффициенты
                    })
                })
            }
        })
        this.recolor()//Перерисовываем карту после обучения
    }
}


nn = new SOM(3) // Создаем экземпляр классе самоорганизующейся карты

window.onload = () => {
    trainingData()
    console.log(testData)
}
