document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const storyPreviews = document.querySelectorAll('.story-preview');
    const storyModal = document.getElementById('storyModal');
    const modalTitle = document.getElementById('storyModalTitle');
    const modalBody = document.getElementById('storyModalBody');
    const modalClose = document.getElementById('storyModalClose');

    // 预览区点击事件
    storyPreviews.forEach(preview => {
        preview.addEventListener('click', function() {
            const timelineItem = this.closest('.timeline-item');
            const fullStory = timelineItem.querySelector('.story-module-full');
            const storyTitle = fullStory.querySelector('h4').innerHTML;
            const storyContent = fullStory.innerHTML;
            
            openStoryModal(storyTitle, storyContent);
        });
    });

    // 打开模态框
    function openStoryModal(title, content) {
        modalTitle.innerHTML = title;
        modalBody.innerHTML = content;
        storyModal.style.display = 'block';
        setTimeout(() => {
            storyModal.style.opacity = '1';
            storyModal.querySelector('.story-modal-content').style.transform = 'translateY(0)';
        }, 10);
        document.body.style.overflow = 'hidden';
    }

    // 关闭模态框
    function closeStoryModal() {
        storyModal.style.opacity = '0';
        storyModal.querySelector('.story-modal-content').style.transform = 'translateY(-30px)';
        setTimeout(() => {
            storyModal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    // 关闭按钮和点击背景关闭
    modalClose.addEventListener('click', closeStoryModal);
    storyModal.addEventListener('click', function(e) {
        if (e.target === this) closeStoryModal();
    });

    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && storyModal.style.display === 'block') {
            closeStoryModal();
        }
    });
});