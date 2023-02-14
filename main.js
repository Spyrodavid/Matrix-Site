// get context for each input
const input_canvas = document.getElementById("input_canvas");
const input_ctx = input_canvas.getContext("2d");

const output_canvas = document.getElementById("output_canvas");
const output_ctx = output_canvas.getContext("2d");

const matrix_section = document.getElementById("matrix_section");

const validity = document.getElementById("validity");

input_canvas.height = parseInt(input_canvas.width * .7)
output_canvas.height = parseInt(output_canvas.width * .7)


// get dimension of each canvas
out_width = output_canvas.width
out_height = output_canvas.height

in_width = input_canvas.width
in_height = input_canvas.height

input_ctx.translate(in_width / 2, in_height / 2)
output_ctx.translate(out_width / 2, out_height / 2)

input_ctx.scale(1, -1)
output_ctx.scale(1, -1)


input_points = []
output_points = []
input_points_radius = 5

input_canvas.addEventListener("click", (e) => {
    input_points.push(math.matrix([
        e.offsetX - in_width / 2, -(e.offsetY - in_height / 2)
    ]))
    output_points = [...input_points]
});

var program_start = Date.now()

var t1 = Date.now()
var t2 = Date.now()


function MainLoop() {


    input_ctx.fillStyle = "white";
    input_ctx.fillRect(-in_width / 2, -in_height / 2, in_width, in_height)

    output_ctx.fillStyle = "white";
    output_ctx.fillRect(-out_width / 2, -out_height / 2, out_width, out_height)

    // draw grid lines on Input
    input_ctx.beginPath();
    input_ctx.moveTo(0, in_height / 2);
    input_ctx.lineTo(0, -in_height / 2);

    input_ctx.moveTo(in_width / 2, 0);
    input_ctx.lineTo(-in_width / 2, 0);
    input_ctx.stroke();


    // draw grid lines on Output
    output_ctx.beginPath();
    output_ctx.moveTo(0, in_height / 2);
    output_ctx.lineTo(0, -in_height / 2);

    output_ctx.moveTo(in_width / 2, 0);
    output_ctx.lineTo(-in_width / 2, 0);
    output_ctx.stroke();


    validity.innerHTML = "All Matrices Valid!"
    validity.style.color = "black"
    //matrix_settings_node.getElementsByClassName("matrix_apply_button")[0].disabled = false

    matrices_to_multiply = []

    matrix_nodes = matrix_section.getElementsByClassName("matrix")
    for (let i = 0; i < matrix_nodes.length; i++) {
        var matrix_node = matrix_nodes[i]
        matrix_inputs = matrix_node.children

        var is_valid_flag = true
        var is_live_matrix_flag = true
        var is_number_flag = true


        matrix_values = Array.from(matrix_inputs).map((el) => {return el.value})

        // check is live matrix
        if (!matrix_values.some((el) => 
                            {return el.includes("th")})) 
        {
            is_live_matrix_flag = false
        }


        // replace time elapsed
        if (is_live_matrix_flag) {
            theta = (Date.now() - program_start) / 1000
            matrix_values = matrix_values.map((el) => 
                                {return el.replaceAll("th", "(" + String(theta) + ")")})
        }

        // make sure expression is fully formed
        try {
            var matrix_values = matrix_values.map((el) => 
                            {return el === "" ? 0 : math.evaluate(el)})
            is_valid_flag = true
        } catch (err) {
            is_valid_flag = false
        }

        // make sure expression evaluates to number
        if (is_valid_flag) {
            
            for (const value of matrix_values) { 
                
                if (isNaN(Number(value))) {
                    is_number_flag = false
                }
            }
        }


        if (!(is_valid_flag && is_number_flag)) {
            validity.innerHTML = "Invalid Value in a Matrix!"
            validity.style.color = "red"
            //matrix_settings_node.getElementsByClassName("matrix_apply_button")[0].disabled = true
            break
        }

        // allready exited if invalid matrix
        if (is_live_matrix_flag) {
            new_matrix = math.matrix([
                [
                    matrix_values[0],
                    matrix_values[1]
                ],
                [
                    matrix_values[2],
                    matrix_values[3]
                ]
            ])
            matrices_to_multiply.push(new_matrix)
        }
    }

    // input draw
    for (let point_index = 0; point_index < input_points.length; point_index++) {
        const current_point = input_points[point_index];

        // draw point
        input_ctx.strokeStyle = `black`
        input_ctx.beginPath();
        input_ctx.arc(current_point.get([0]), current_point.get([1]), input_points_radius, 0, 2 * Math.PI);
        input_ctx.arc(current_point.get([0]), current_point.get([1]), input_points_radius, 0, 2 * Math.PI);
        input_ctx.stroke();
    }

    // output draw
    for (let point_index = 0; point_index < output_points.length; point_index++) {
        var current_point = output_points[point_index];

        // go through each matrix
        for (let matrix_index = 0; matrix_index < matrices_to_multiply.length; matrix_index++) {
            const current_matrix = matrices_to_multiply[matrix_index];

            current_point = math.multiply(current_point, current_matrix)
        }

        // draw point
        output_ctx.strokeStyle = `black`
        output_ctx.beginPath();
        output_ctx.arc(current_point.get([0]), current_point.get([1]), input_points_radius, 0, 2 * Math.PI);
        output_ctx.arc(current_point.get([0]), current_point.get([1]), input_points_radius, 0, 2 * Math.PI);
        output_ctx.stroke();
        
    }


    requestAnimationFrame(MainLoop)

}
requestAnimationFrame(MainLoop)


function newMatrix(default_inputs) {
    var matrix = document.createElement("div")
    var matrix_and_settings = document.createElement("div")
    matrix_and_settings.classList.add("matrix_and_settings")
    matrix_and_settings.appendChild(matrix)
    matrix.classList.add("matrix")
    matrix.classList.add("grid")

    matrix_section.appendChild(matrix_and_settings)

    matrix_columns = 2
    matrix_rows = 2
    for (let i = 1; i <= matrix_columns; i++) {
        for (let j = 1; j <= matrix_rows; j++) {
            matrix_input = document.createElement("input")

            if (default_inputs.length == 0) {
                if (i == j) {
                    matrix_input.defaultValue = "1"
                } else {
                    matrix_input.defaultValue = "0"
                }
            } else {
                matrix_input.defaultValue = default_inputs[(i - 1) + 2*(j - 1)]
            }

            matrix_input.style.gridRow = i
            matrix_input.style.gridColumn = j
            matrix_input.spellCheck = false

            matrix.appendChild(matrix_input)
            
        }
    }

    var matrix_buttons = document.createElement("div")
    matrix_buttons.classList.add("matrix_buttons")
    matrix_and_settings.appendChild(matrix_buttons)

    
    matrix_delete_button = document.createElement("button")
    matrix_delete_button.innerHTML = "❌"
    matrix_delete_button.classList.add("matrix_delete_button", "matrix_button")
    matrix_delete_button.addEventListener("click", () => {
        matrix_and_settings.remove()
    })
    matrix_buttons.appendChild(matrix_delete_button)


    matrix_apply_button = document.createElement("button")
    matrix_apply_button.innerHTML = "Apply Matrix"
    matrix_apply_button.classList.add("matrix_apply_button", "matrix_button")
    matrix_apply_button.addEventListener("click", () => {
        matrix_apply(matrix)
    })
    matrix_buttons.appendChild(matrix_apply_button)

}

function matrix_apply(matrix_node) {
        matrix_inputs = matrix_node.children

        var is_valid_flag = true
        var is_live_matrix_flag = true
        var is_number_flag = true

        // check is live matrix
        if (!Array.from(matrix_inputs).some((el) => 
                            {return el.value.includes("th")})) 
        {
            is_live_matrix_flag = false
        }

        matrix_values = Array.from(matrix_inputs)

        // replace time elapsed
        if (is_live_matrix_flag) {
            theta = (Date.now() - program_start) / 1000
            matrix_values = matrix_inputs.map((el) => 
                                {return el.value.replaceAll("th", "(" + String(theta) + ")")})
        }

        // make sure expression is fully formed
        try {
            var matrix_values = matrix_values.map((el) => 
                            {return el.value === "" ? 0 : math.evaluate(el.value)})
            is_valid_flag = true
        } catch (err) {
            is_valid_flag = false
        }

        // make sure expression evaluates to number
        if (is_valid_flag) {
            
            for (const value of matrix_values) { 
                
                if (isNaN(Number(value))) {
                    is_number_flag = false
                }
            }
        }

        if (!(is_valid_flag && is_number_flag)) {
            validity.innerHTML = "Invalid Value in a Matrix!"
            validity.style.color = "red"
            //matrix_settings_node.getElementsByClassName("matrix_apply_button")[0].disabled = true
            return
        }

        // allready exited if invalid matrix
        var new_matrix = math.matrix([
            [
                matrix_values[0],
                matrix_values[1]
            ],
            [
                matrix_values[2],
                matrix_values[3]
            ]
        ])
        output_points = output_points.map((point) => {return math.multiply(point, new_matrix)})
}

function clearPoints() {
    input_points = []
}

function addSmiley() {
    input_points = [
        math.matrix(
            [50, 40]
        ),
        math.matrix(
            [-50, 40]
        ),
        math.matrix(
            [70, -20]
        ),
        math.matrix(
            [-70, -20]
        ),
        math.matrix(
            [40, -30]
        ),
        math.matrix(
            [-40, -30]
        ),
        math.matrix(
            [20, -35]
        ),
        math.matrix(
            [-20, -35]
        )
    ]
    output_points = [...input_points]
}

function addHouse() {
    input_points = [
        math.matrix(
            [0, 41]
        ),
        math.matrix(
            [25, 43]
        ),
        math.matrix(
            [56, 39]
        ),
        math.matrix(
            [56, 60]
        ),
        math.matrix(
            [56, 20]
        ),
        math.matrix(
            [84, 31]
        ),
        math.matrix(
            [108, 0]
        ),
        math.matrix(
            [0, -41]
        ),
        math.matrix(
            [25, -43]
        ),
        math.matrix(
            [56, -39]
        ),
        math.matrix(
            [56, -60]
        ),
        math.matrix(
            [56, -20]
        ),
        math.matrix(
            [84, -31]
        ),
        math.matrix(
            [56, 0]
        )
    ]
    output_points = [...input_points]
}
