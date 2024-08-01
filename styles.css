body {
    margin: 0;
    padding: 0;
    font-family: 'Consolas', monospace;
    overflow: hidden; /* Disable scrolling */
}

#map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

#display-area {
    position: absolute;
    top: 24px;
    right: 24px;
    color: red;
    font-size: 24px;
    font-variant-numeric: tabular-nums;
    z-index: 2;
}

#line-vertical {
    position: absolute;
    top: 0;
    left: 50%;
    width: 12px;
    height: 100%;
    background-color: red;
    transform: translateX(-50%);
    opacity: 0;
    z-index: 3;
    animation: lineMoveVertical 30s linear forwards;
}

#line-horizontal {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 12px;
    background-color: red;
    transform: translateY(-50%);
    opacity: 0;
    z-index: 3;
    animation: lineMoveHorizontal 30s linear forwards;
}

@keyframes lineMoveVertical {
    0% { top: 0; opacity: 0; }
    100% { top: 100%; opacity: 1; }
}

@keyframes lineMoveHorizontal {
    0% { left: 0; opacity: 0; }
    100% { left: 100%; opacity: 1; }
}
