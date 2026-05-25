package com.hostel.service;

import com.hostel.dto.NoticeDTO;
import com.hostel.entity.Notice;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.CommonConverters;
import com.hostel.mapper.NoticeMapper;
import com.hostel.repository.NoticeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final NoticeMapper noticeMapper;

    public NoticeService(NoticeRepository noticeRepository, NoticeMapper noticeMapper) {
        this.noticeRepository = noticeRepository;
        this.noticeMapper = noticeMapper;
    }

    @Transactional(readOnly = true)
    public Page<NoticeDTO> getAllNotices(@NonNull Pageable pageable) {
        return noticeRepository.findAll(pageable).map(noticeMapper::toDto);
    }

    @Transactional(readOnly = true)
    public NoticeDTO getNoticeById(@NonNull Long id) {
        return noticeMapper.toDto(loadNotice(id));
    }

    @Transactional(readOnly = true)
    public Page<NoticeDTO> getActiveNotices(@NonNull Pageable pageable) {
        return noticeRepository.findByIsActiveTrue(pageable).map(noticeMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<NoticeDTO> getNoticesByCategory(String category, @NonNull Pageable pageable) {
        Notice.Category categoryEnum = CommonConverters.toEnum(Notice.Category.class, category);
        return noticeRepository.findByCategory(categoryEnum, pageable).map(noticeMapper::toDto);
    }

    public NoticeDTO createNotice(NoticeDTO dto) {
        Notice entity = noticeMapper.toEntity(dto);
        return noticeMapper.toDto(noticeRepository.save(entity));
    }

    public NoticeDTO updateNotice(@NonNull Long id, NoticeDTO dto) {
        Notice entity = loadNotice(id);
        noticeMapper.updateEntityFromDto(dto, entity);
        return noticeMapper.toDto(noticeRepository.save(entity));
    }

    public void deleteNotice(@NonNull Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notice not found with id: " + id);
        }
        noticeRepository.deleteById(id);
    }

    private Notice loadNotice(Long id) {
        return noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with id: " + id));
    }
}
