interface WeixinStatic {
    /**
     * wx.request发起的是 HTTPS 请求。一个微信小程序，同时只能有5个网络请求连接。
     */
    request(options: Object);
    /**
     * 将本地资源上传到开发者服务器。如页面通过 wx.chooseImage 等接口获取到一个本地资源的临时文件路径后，可通过此接口将本地资源上传到指定服务器。客户端发起一个 HTTPS POST 请求，其中 content-type 为 multipart/form-data 。
     */
    uploadFile(options: {
        // 开发者服务器 url
        url: string,
        // 要上传文件资源的路径
        filePath: string,
        // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
        name: string,
        // HTTP 请求 Header , header 中不能设置 Referer
        header?: Object,
        // HTTP 请求中其他额外的 form data
        formData?: Object,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 下载文件资源到本地。客户端直接发起一个 HTTP GET 请求，返回文件的本地临时路径。
     */
    downloadFile(options: {
        // 下载资源的 url
        url: string,
        // HTTP 请求 Header
        header?: Object,
        // 下载成功后以 tempFilePath 的形式传给页面，res = {tempFilePath: '文件的临时路径'}
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 创建一个 WebSocket 连接；一个微信小程序同时只能有一个 WebSocket 连接，如果当前已存在一个 WebSocket 连接，会自动关闭该连接，并重新创建一个 WebSocket 连接。
     */
    connectSocket(options: {
        // 开发者服务器接口地址，必须是 wss 协议，且域名必须是后台配置的合法域名
        url: string,
        // 请求的数据
        data?: Object,
        // HTTP Header , header 中不能设置 Referer
        header?: Object,
        // 默认是GET，有效值为： OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        method?: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 监听WebSocket连接打开事件。
     */
    onSocketOpen(callback: Function);
    /**
     * 监听WebSocket错误。
     */
    onSocketError(callback: Function);
    /**
     * 通过 WebSocket 连接发送数据，需要先 wx.connectSocket，并在 wx.onSocketOpen 回调之后才能发送。
     */
    sendSocketMessage(options: {
        // 需要发送的内容
        data: string | ArrayBuffer,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 监听WebSocket接受到服务器的消息事件。
     */
    onSocketMessage(callback: Function);
    /**
     * 关闭WebSocket连接。
     */
    closeSocket(options: any);
    /**
     * 监听WebSocket关闭。
     */
    onSocketClose(callback: Function);
    /**
     * 获取图片信息
     */
    getImageInfo(options: {
        // 图片的路径，可以是相对路径，临时文件路径，存储文件路径，网络图片路径
        src: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 开始录音。当主动调用wx.stopRecord，或者录音超过1分钟时自动结束录音，返回录音文件的临时文件路径。
     */
    startRecord(options: {
        // 录音成功后调用，返回录音文件的临时文件路径，res = {tempFilePath: '录音文件的临时路径'}
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * ​    主动调用停止录音。
     */
    stopRecord();
    /**
     * 开始播放语音，同时只允许一个语音文件正在播放，如果前一个语音文件还没播放完，将中断前一个语音播放。
     */
    playVoice(options: {
        // 需要播放的语音文件的文件路径
        filePath: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 暂停正在播放的语音。再次调用wx.playVoice播放同一个文件时，会从暂停处开始播放。如果想从头开始播放，需要先调用 wx.stopVoice。
     */
    pauseVoice();
    /**
     * 结束播放语音。
     */
    stopVoice();
    /**
     * 获取音乐播放状态。
     */
    getBackgroundAudioPlayerState(options: {
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 播放音乐，同时只能有一首音乐正在播放。
     */
    playBackgroundAudio(options: {
        // 音乐链接
        dataUrl: string,
        // 音乐标题
        title?: string,
        // 封面URL
        coverImgUrl?: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 暂停播放音乐。
     */
    pauseBackgroundAudio();
    /**
     * 控制音乐播放进度。
     */
    seekBackgroundAudio(options: {
        // 音乐位置，单位：秒
        position: number,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 停止播放音乐。
     */
    stopBackgroundAudio();
    /**
     * 监听音乐播放。
     */
    onBackgroundAudioPlay(callback: Function);
    /**
     * 监听音乐暂停。
     */
    onBackgroundAudioPause(callback: Function);
    /**
     * 监听音乐停止。
     */
    onBackgroundAudioStop(callback: Function);
    /**
     * 保存文件到本地。
     */
    saveFile(options: {
        // 需要保存的文件的临时路径
        tempFilePath: string,
        // 返回文件的保存路径，res = {savedFilePath: '文件的保存路径'}
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 获取本地已保存的文件列表
     */
    getSavedFileList(options: {
        // 接口调用成功的回调函数，返回结果见success返回参数说明
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 获取本地文件的文件信息
     */
    getSavedFileInfo(options: {
        // 文件路径
        filePath: string,
        // 接口调用成功的回调函数，返回结果见success返回参数说明
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 删除本地存储的文件
     */
    removeSavedFile(options: {
        // 需要删除的文件路径
        filePath: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 新开页面打开文档，支持格式：doc, xls, ppt, pdf, docx, xlsx, pptx
     */
    openDocument(options: {
        // 文件路径，可通过 downFile 获得
        filePath: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 创建并返回 audio 上下文 audioContext 对象
     */
    createAudioContext(audioId: string);
    /**
     * 创建并返回 video 上下文 videoContext 对象
     */
    createVideoContext(videoId: string);
    /**
     * 将数据存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个异步接口。
     */
    setStorage(options: {
        // 本地缓存中的指定的 key
        key: string,
        // 需要存储的内容
        data: Object | string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 将 data 存储在本地缓存中指定的 key 中，会覆盖掉原来该 key 对应的内容，这是一个同步接口。
     */
    setStorageSync(key: string, data: any);
    /**
     * 从本地缓存中异步获取指定 key 对应的内容。
     */
    getStorage(options: {
        // 本地缓存中的指定的 key
        key: string,
        // 接口调用的回调函数,res = {data: key对应的内容}
        success: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 从本地缓存中同步获取指定 key 对应的内容。
     */
    getStorageSync(key: string);
    /**
     * 异步获取当前storage的相关信息
     */
    getStorageInfo(options: {
        // 接口调用的回调函数，详见返回参数说明
        success: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 同步获取当前storage的相关信息
     */
    getStorageInfoSync();
    /**
     * 从本地缓存中异步移除指定 key 。
     */
    removeStorage(options: {
        // 本地缓存中的指定的 key
        key: string,
        // 接口调用的回调函数
        success: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 从本地缓存中同步移除指定 key 。
     */
    removeStorageSync(key: string);
    /**
     * 清理本地数据缓存。
     */
    clearStorage();
    /**
     * 同步清理本地数据缓存
     */
    clearStorageSync();
    /**
     * 获取当前的地理位置、速度。
     */
    getLocation(options: {
        // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于wx.openLocation的坐标
        type?: string,
        // 接口调用成功的回调函数，返回内容详见返回参数说明。
        success: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 打开地图选择位置
     */
    chooseLocation(options: {
        // 接口调用成功的回调函数，返回内容详见返回参数说明。
        success: Function,
        // 用户取消时调用
        cancel?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * ​    使用微信内置地图查看位置
     */
    openLocation(options: {
        // 纬度，范围为-90~90，负数表示南纬
        latitude: number,
        // 经度，范围为-180~180，负数表示西经
        longitude: number,
        // 缩放比例，范围1~28，默认为28
        scale?: number,
        // 位置名
        name?: string,
        // 地址的详细说明
        address?: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 获取网络类型。
     */
    getNetworkType(options: {
        // 接口调用成功，返回网络类型 networkType
        success: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 获取系统信息。
     */
    getSystemInfo(options: {
        // 接口调用成功的回调
        success: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 获取系统信息同步接口
     */
    getSystemInfoSync();
    /**
     * 监听重力感应数据，频率：5次/秒
     */
    onAccelerometerChange(callback: Function);
    /**
     * 监听罗盘数据，频率：5次/秒
     */
    onCompassChange(callback: Function);
    /**
     * OBJECT参数说明：
     */
    makePhoneCall();
    /**
     * 显示消息提示框
     */
    showToast(options: {
        // 提示的内容
        title: string,
        // 图标，只支持"success"、"loading"
        icon?: string,
        // 提示的延迟时间，单位毫秒，默认：1500, 最大为10000
        duration?: number,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 隐藏消息提示框
     */
    hideToast();
    /**
     * ​显示模态弹窗
     */
    showModal(options: {
        // 提示的标题
        title?: string,
        // 提示的内容
        content: string,
        // 是否显示取消按钮，默认为 true
        showCancel?: boolean,
        // 取消按钮的文字，默认为"取消"，最多 4 个字符
        cancelText?: string,
        // 取消按钮的文字颜色，默认为"#000000"
        cancelColor?: string,
        // 确定按钮的文字，默认为"确定"，最多 4 个字符
        confirmText?: string,
        // 确定按钮的文字颜色，默认为"#3CC51F"
        confirmColor?: string,
        // 接口调用成功的回调函数，返回res.confirm为true时，表示用户点击确定按钮
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 动态设置当前页面的标题。
     */
    setNavigationBarTitle(options: {
        // 页面标题
        title: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 在当前页面显示导航条加载动画。
     */
    showNavigationBarLoading();
    /**
     * 隐藏导航条加载动画。
     */
    hideNavigationBarLoading();
    /**
     * 保留当前页面，跳转到应用内的某个页面，使用wx.navigateBack可以返回到原页面。
     */
    navigateTo(options: {
        // 需要跳转的应用内页面的路径 , 路径后可以带参数。参数与路径之间使用?分隔，参数键与参数值用=相连，不同参数用&分隔；如 'path?key=value&key2=value2'
        url: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 关闭当前页面，跳转到应用内的某个页面。
     */
    redirectTo(options: {
        // 需要跳转的应用内页面的路径
        url: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 关闭当前页面，返回上一页面或多级页面。可通过 getCurrentPages()) 获取当前的页面栈，决定需要返回几层。
     */
    navigateBack(options?: {
        // 返回的页面数，如果 delta 大于现有页面数，则返回到首页。
        delta: number
    });
    /**
     * 创建一个动画实例animation。调用实例的方法来描述动画。最后通过动画实例的export方法导出动画数据传递给组件的animation属性。
     */
    createAnimation();
    /**
     * 动画实例可以调用以下方法来描述动画，调用结束后会返回自身，支持链式调用的写法。
     */
    animation;
    /**
     * 创建并返回绘图上下文context对象。
     */
    createContext();
    /**
     * 把当前画布的内容导出生成图片，并返回文件路径
     */
    canvasToTempFilePath(options: {
        // 画布标识，传入 <canvas/> 的 cavas-id
        canvasId: string
    });
    /**
     * 收起键盘。
     */
    hideKeyboard();
    /**
     * 停止当前页面下拉刷新。详见页面相关事件处理函数。
     */
    stopPullDownRefresh();
    /**
     * 调用接口获取登录凭证（code）进而换取用户登录态信息，包括用户的唯一标识（openid） 及本次登录的 会话密钥（session_key）。用户数据的加解密通讯需要依赖会话密钥完成。
     */
    login(options: {
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 检查登陆态是否过期
     */
    checkSession();
    /**
     * 发起微信支付
     */
    requestPayment(options: {
        // 时间戳从1970年1月1日00:00:00至今的秒数,即当前的时间
        timeStamp: string,
        // 随机字符串，长度为32个字符以下。
        nonceStr: string,
        // 统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*
        package: string,
        // 签名算法，暂支持 MD5
        signType: string,
        // 签名,具体签名方案参见微信公众号支付帮助文档;
        paySign: string,
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function,
        // 接口调用结束的回调函数（调用成功、失败都会执行）
        complete?: Function
    });
    /**
     * 获取用户信息
     */
    getUserInfo(options: {
        // 接口调用成功的回调函数
        success?: Function,
        // 接口调用失败的回调函数
        fail?: Function
    });
    onNetworkStatusChange(callback: Function);
}

declare var Page: Function;
declare var getCurrentPages: Function;
declare var wx: WeixinStatic;
