import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { HRCourseDetails } from "./course-details";

// Define the form schema
const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  avatar: z.string().url("Must be a valid URL"),
  author: z.object({
    name: z.string().min(1, "Author name is required"),
    role: z.string().min(1, "Author role is required"),
    avatar: z.string().url("Must be a valid URL"),
  }),
  chapters: z.array(z.object({
    id: z.number(),
    title: z.string().min(1, "Chapter title is required"),
    duration: z.string().min(1, "Duration is required"),
    videoUrl: z.string().min(1, "Video URL is required"),
    resources: z.array(z.string()),
    hasQuiz: z.boolean(),
  })).min(1, "At least one chapter is required"),
});

type CourseFormValues = z.infer<typeof courseSchema>;

const categories = [
  "Vocabulary",
  "Communication",
  "Leadership",
  "Professional Development",
  "Business Skills",
  "Personal Development",
  "Project Management",
  "Innovation",
  "Customer Relations",
];

export function CreateCoursePage() {
  const [showPreview, setShowPreview] = useState(false);
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      chapters: [],
      author: {
        name: "",
        role: "",
        avatar: "",
      },
    },
  });

  const onSubmit = (data: CourseFormValues) => {
    console.log(data);
    // Here you would typically send the data to your backend
  };

  const addChapter = () => {
    const chapters = form.getValues("chapters");
    form.setValue("chapters", [
      ...chapters,
      {
        id: chapters.length + 1,
        title: "",
        duration: "",
        videoUrl: "",
        resources: [],
        hasQuiz: false,
      },
    ]);
  };

  const removeChapter = (index: number) => {
    const chapters = form.getValues("chapters");
    form.setValue(
      "chapters",
      chapters.filter((_, i) => i !== index)
    );
  };

  const addResource = (chapterIndex: number) => {
    const chapters = form.getValues("chapters");
    const chapter = chapters[chapterIndex];
    chapter.resources = [...chapter.resources, ""];
    form.setValue("chapters", chapters);
  };

  const removeResource = (chapterIndex: number, resourceIndex: number) => {
    const chapters = form.getValues("chapters");
    const chapter = chapters[chapterIndex];
    chapter.resources = chapter.resources.filter((_, i) => i !== resourceIndex);
    form.setValue("chapters", chapters);
  };

  if (showPreview) {
    return (
      <div className="container mx-auto p-6">
        <Button
          onClick={() => setShowPreview(false)}
          className="mb-6"
          variant="outline"
        >
          Back to Edit
        </Button>
        <HRCourseDetails previewData={form.getValues()} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Course Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Author Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Author Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="author.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author.role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author Role</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="author.avatar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author Avatar URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Chapters */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Chapters</CardTitle>
                  <Button type="button" onClick={addChapter} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {form.watch("chapters").map((chapter, chapterIndex) => (
                    <Card key={chapter.id}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Chapter {chapterIndex + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeChapter(chapterIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`chapters.${chapterIndex}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`chapters.${chapterIndex}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (e.g., "30 min")</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`chapters.${chapterIndex}.videoUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Video URL</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`chapters.${chapterIndex}.hasQuiz`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Has Quiz</FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Resources */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <FormLabel>Resources</FormLabel>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addResource(chapterIndex)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Resource
                            </Button>
                          </div>
                          {chapter.resources.map((_, resourceIndex) => (
                            <div
                              key={resourceIndex}
                              className="flex items-center space-x-2 mt-2"
                            >
                              <FormField
                                control={form.control}
                                name={`chapters.${chapterIndex}.resources.${resourceIndex}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input {...field} placeholder="Resource name" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  removeResource(chapterIndex, resourceIndex)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button type="submit">Create Course</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 