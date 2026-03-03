Component({
  data: {
    value: 0,
    list: [
      { value: 0, label: '主页', icon: 'home' },
      { value: 1, label: '练习', icon: 'edit' },
      { value: 2, label: '资源', icon: 'folder' }
    ]
  },

  methods: {
    onChange(e) {
      const value = e.detail.value;
      this.setData({ value });
      
      const pages = [
        '/pages/index/index',
        '/pages/practice/practice',
        '/pages/resource/resource'
      ];
      
      wx.switchTab({
        url: pages[value]
      });
    },

    // 供页面调用，更新选中状态
    setSelected(idx) {
      this.setData({ value: idx });
    }
  }
});
