var bezierHelper = (function() {
    var canvas = document.getElementById('curve'),
        ctx = canvas.getContext('2d'),
        width = canvas.width,
        height = canvas.height,
        bezier = [0.4, 0.2, 0.4, 0.8],
        isDragging = false,
        dragPoint = -1;

    function drawPoint(x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawBezier() {
        ctx.clearRect(0, 0, width, height);
        
        // 绘制网格
        ctx.strokeStyle = '#eee';
        ctx.beginPath();
        for(var i = 0; i < width; i += 20) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
        }
        for(var i = 0; i < height; i += 20) {
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
        }
        ctx.stroke();

        // 绘制贝塞尔曲线
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.bezierCurveTo(
            width * bezier[0], height * (1 - bezier[1]),
            width * bezier[2], height * (1 - bezier[3]),
            width, 0
        );
        ctx.stroke();

        // 绘制控制点
        ctx.fillStyle = 'red';
        drawPoint(width * bezier[0], height * (1 - bezier[1]));
        drawPoint(width * bezier[2], height * (1 - bezier[3]));
    }

    canvas.addEventListener('mousedown', function(e) {
        var rect = canvas.getBoundingClientRect(),
            x = (e.clientX - rect.left) / width,
            y = 1 - (e.clientY - rect.top) / height;

        // 检查是否点击了控制点
        var d1 = Math.hypot(x - bezier[0], y - bezier[1]);
        var d2 = Math.hypot(x - bezier[2], y - bezier[3]);

        if(d1 < 0.02) dragPoint = 0;
        else if(d2 < 0.02) dragPoint = 1;
        
        if(dragPoint >= 0) isDragging = true;
    });

    canvas.addEventListener('mousemove', function(e) {
        if(!isDragging) return;

        var rect = canvas.getBoundingClientRect(),
            x = (e.clientX - rect.left) / width,
            y = 1 - (e.clientY - rect.top) / height;

        // 更新控制点位置
        if(dragPoint === 0) {
            bezier[0] = Math.max(0, Math.min(1, x));
            bezier[1] = Math.max(0, Math.min(1, y));
        } else {
            bezier[2] = Math.max(0, Math.min(1, x));
            bezier[3] = Math.max(0, Math.min(1, y));
        }

        drawBezier();
        if(window.onBezierUpdate) {
            window.onBezierUpdate(bezier);
        }
    });

    canvas.addEventListener('mouseup', function() {
        isDragging = false;
        dragPoint = -1;
    });

    canvas.addEventListener('mouseleave', function() {
        isDragging = false;
        dragPoint = -1;
    });

    return {
        setBezier: function(b) {
            bezier = b;
            drawBezier();
        },
        getBezier: function() {
            return bezier;
        }
    };
})(); 