package backend.backend.Service.Impl;

import backend.backend.Dto.Request.CreateAssessmentRequest;
import backend.backend.Dto.Request.CreateChapterRequest;
import backend.backend.Dto.Request.UpdateChapterRequest;
import backend.backend.Dto.Response.AssessmentResponse;
import backend.backend.Dto.Response.ChapterResponse;
import backend.backend.Dto.Response.OptionResponse;
import backend.backend.Dto.Response.QuestionResponse;
import backend.backend.Entity.Assessment;
import backend.backend.Entity.Chapter;
import backend.backend.Entity.Course;
import backend.backend.Entity.Option;
import backend.backend.Entity.Question;
import backend.backend.Entity.User;
import backend.backend.Exceptions.BadRequestException;
import backend.backend.Exceptions.ResourceNotFoundException;
import backend.backend.Exceptions.UnauthorizedException;
import backend.backend.Repository.AssessmentRepository;
import backend.backend.Repository.ChapterRepository;
import backend.backend.Repository.CourseRepository;
import backend.backend.Service.ChapterService;
import backend.backend.Utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;
    private final AssessmentRepository assessmentRepository;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponse> getChaptersByCourse(UUID courseId) {
        courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        return chapterRepository.findByCourseIdOrderByChapterOrderAsc(courseId)
                .stream()
                .map(this::mapToChapterResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChapterResponse addChapter(UUID courseId, CreateChapterRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to add chapters to this course");
        }
        Integer order = request.getChapterOrder();
        if (order == null) {
            order = chapterRepository.findByCourseIdOrderByChapterOrderAsc(courseId).size() + 1;
        }
        Chapter chapter = Chapter.builder()
                .course(course)
                .title(request.getTitle())
                .duration(request.getDuration())
                .type(request.getType())
                .videoUrl(request.getVideoUrl())
                .textContent(request.getTextContent())
                .description(request.getDescription())
                .chapterOrder(order)
                .deadline(request.getDeadline())
                .penaltyPerDay(request.getPenaltyPerDay() != null ? request.getPenaltyPerDay() : 0.0)
                .isPublished(true)
                .build();
        chapterRepository.save(chapter);
        return mapToChapterResponse(chapter);
    }

    @Override
    @Transactional
    public ChapterResponse updateChapter(UUID courseId, UUID chapterId, UpdateChapterRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this chapter");
        }
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + chapterId));

        if (request.getTitle() != null) {
            chapter.setTitle(request.getTitle());
        }
        if (request.getDuration() != null) {
            chapter.setDuration(request.getDuration());
        }
        if (request.getType() != null) {
            chapter.setType(request.getType());
        }
        if (request.getVideoUrl() != null) {
            chapter.setVideoUrl(request.getVideoUrl());
        }
        if (request.getTextContent() != null) {
            chapter.setTextContent(request.getTextContent());
        }
        if (request.getDescription() != null) {
            chapter.setDescription(request.getDescription());
        }
        if (request.getChapterOrder() != null) {
            chapter.setChapterOrder(request.getChapterOrder());
        }
        if (request.getDeadline() != null) {
            chapter.setDeadline(request.getDeadline());
        }
        if (request.getPenaltyPerDay() != null) {
            chapter.setPenaltyPerDay(request.getPenaltyPerDay());
        }
        if (request.getIsPublished() != null) {
            chapter.setIsPublished(request.getIsPublished());
        }

        chapterRepository.save(chapter);
        return mapToChapterResponse(chapter);
    }

    @Override
    @Transactional
    public void deleteChapter(UUID courseId, UUID chapterId) {
        User currentUser = securityUtils.getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete chapters from this course");
        }
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + chapterId));
        chapterRepository.delete(chapter);
    }

    @Override
    @Transactional
    public AssessmentResponse addChapterAssessment(UUID courseId, UUID chapterId, CreateAssessmentRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to add assessment to this chapter");
        }
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + chapterId));
        if (chapter.getAssessment() != null) {
            throw new BadRequestException("Assessment already exists for this chapter");
        }
        Assessment assessment = buildAssessment(request);
        assessment.setChapter(chapter);
        assessmentRepository.save(assessment);
        return mapToAssessmentResponse(assessment);
    }

    @Override
    @Transactional
    public AssessmentResponse addGrandAssessment(UUID courseId, CreateAssessmentRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));
        if (!course.getInstructor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to add grand assessment");
        }
        if (course.getGrandAssessment() != null) {
            throw new BadRequestException("Grand assessment already exists for this course");
        }
        Assessment assessment = buildAssessment(request);
        assessment.setCourse(course);
        assessmentRepository.save(assessment);
        return mapToAssessmentResponse(assessment);
    }

    private Assessment buildAssessment(CreateAssessmentRequest request) {
        Assessment assessment = Assessment.builder()
                .title(request.getTitle() != null ? request.getTitle() : "Assessment")
                .passingScore(request.getPassingScore() != null ? request.getPassingScore() : 70)
                .questions(new ArrayList<>())
                .build();
        for (CreateAssessmentRequest.QuestionRequest qr : request.getQuestions()) {
            Question question = Question.builder()
                    .assessment(assessment)
                    .questionText(qr.getQuestionText())
                    .correctOptionIndex(qr.getCorrectOptionIndex())
                    .options(new ArrayList<>())
                    .build();
            for (int i = 0; i < qr.getOptions().size(); i++) {
                Option option = Option.builder()
                        .question(question)
                        .optionText(qr.getOptions().get(i))
                        .optionIndex(i)
                        .build();
                question.getOptions().add(option);
            }
            assessment.getQuestions().add(question);
        }
        return assessment;
    }

    private ChapterResponse mapToChapterResponse(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .duration(chapter.getDuration())
                .type(chapter.getType())
                .videoUrl(chapter.getVideoUrl())
                .textContent(chapter.getTextContent())
                .description(chapter.getDescription())
                .chapterOrder(chapter.getChapterOrder())
                .deadline(chapter.getDeadline())
                .penaltyPerDay(chapter.getPenaltyPerDay())
                .isPublished(chapter.getIsPublished())
                .createdAt(chapter.getCreatedAt())
                .assessment(chapter.getAssessment() != null
                        ? mapToAssessmentResponse(chapter.getAssessment())
                        : null)
                .build();
    }

    public AssessmentResponse mapToAssessmentResponse(Assessment assessment) {
        List<QuestionResponse> questions = assessment.getQuestions().stream()
                .map(q -> QuestionResponse.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .correctOptionIndex(q.getCorrectOptionIndex())
                        .options(q.getOptions().stream()
                                .map(o -> OptionResponse.builder()
                                        .id(o.getId())
                                        .optionText(o.getOptionText())
                                        .optionIndex(o.getOptionIndex())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
        return AssessmentResponse.builder()
                .id(assessment.getId())
                .title(assessment.getTitle())
                .passingScore(assessment.getPassingScore())
                .questions(questions)
                .build();
    }
}
